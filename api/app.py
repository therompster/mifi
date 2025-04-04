# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import pooling
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
from functools import wraps
from dotenv import load_dotenv
import plaid
from datetime import timedelta
from datetime import datetime 
import json
import openai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')  # Change this in production

# Database Configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'ifi_user'),
    'password': os.getenv('DB_PASSWORD', 'ifi_password'),
    'database': os.getenv('DB_NAME', 'ifi_finance')
}

# Create a connection pool
db_pool = pooling.MySQLConnectionPool(
    pool_name="ifi_pool",
    pool_size=5,
    **DB_CONFIG
)

# Initialize database with tables
def init_db():
    try:
        connection = db_pool.get_connection()
        cursor = connection.cursor()
        
        # Create users table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(200) NOT NULL,
            dob VARCHAR(20) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            country VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reset_token VARCHAR(200),
            reset_token_expiration TIMESTAMP
        )
        ''')
        
        # Create transactions table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            plaid_account_id INT,
            plaid_transaction_id VARCHAR(200),
            date TIMESTAMP NOT NULL,
            description VARCHAR(200) NOT NULL,
            amount FLOAT NOT NULL,
            type VARCHAR(20) NOT NULL,
            category VARCHAR(50) NOT NULL,
            method VARCHAR(50) NOT NULL,
            is_pending BOOLEAN DEFAULT FALSE,
            location VARCHAR(200),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        ''')
        
        # Create budget_categories table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS budget_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            category VARCHAR(50) NOT NULL,
            budget FLOAT NOT NULL,
            spent FLOAT NOT NULL DEFAULT 0,
            color VARCHAR(20) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        ''')
        
        # Create savings_goals table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS savings_goals (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            category VARCHAR(50) NOT NULL,
            target FLOAT NOT NULL,
            saved FLOAT NOT NULL DEFAULT 0,
            color VARCHAR(20) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        ''')
        
        # Create subscriptions table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            amount FLOAT NOT NULL,
            billing_cycle VARCHAR(20) NOT NULL,
            next_billing TIMESTAMP NOT NULL,
            category VARCHAR(50) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        ''')
        
        # Create plaid_items table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS plaid_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            item_id VARCHAR(200) NOT NULL,
            access_token VARCHAR(200) NOT NULL,
            institution_id VARCHAR(100),
            institution_name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        ''')
        
        # Create plaid_accounts table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS plaid_accounts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            plaid_item_id INT NOT NULL,
            account_id VARCHAR(200) NOT NULL,
            name VARCHAR(100) NOT NULL,
            mask VARCHAR(10),
            type VARCHAR(50) NOT NULL,
            subtype VARCHAR(50),
            current_balance FLOAT,
            available_balance FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (plaid_item_id) REFERENCES plaid_items(id)
        )
        ''')
        
        # Check if the constraint already exists before trying to add it
        cursor.execute("""
        SELECT COUNT(*) as count
        FROM information_schema.TABLE_CONSTRAINTS 
        WHERE CONSTRAINT_SCHEMA = DATABASE() 
        AND CONSTRAINT_NAME = 'fk_transactions_plaid_account'
        """)
        result = cursor.fetchone()
        constraint_exists = result[0] > 0  # Access by index instead of key
        
        # Only add the constraint if it doesn't exist
        if not constraint_exists:
            try:
                cursor.execute("""
                ALTER TABLE transactions
                ADD CONSTRAINT fk_transactions_plaid_account
                FOREIGN KEY (plaid_account_id) REFERENCES plaid_accounts(id)
                """)
            except Exception as e:
                # Log the error but continue (non-fatal)
                print(f"Note: Could not add foreign key: {e}")

        connection.commit()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# Helper function to get database connection
def get_db_connection():
    return db_pool.get_connection()

# Execute database query and return results
def execute_query(query, params=None, fetch=True, fetchone=False):
    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
            
        if fetch:
            if fetchone:
                return cursor.fetchone()
            return cursor.fetchall()
        else:
            connection.commit()
            if cursor.lastrowid:
                return cursor.lastrowid
            return cursor.rowcount
    except Exception as e:
        if connection:
            connection.rollback()
        raise e
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# Decorator for routes that require authentication
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = execute_query("SELECT * FROM users WHERE id = %s", (data['user_id'],), fetchone=True)
            
            if not current_user:
                return jsonify({'message': 'Invalid token!'}), 401
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    user = execute_query("SELECT * FROM users WHERE email = %s", (data['email'],), fetchone=True)
    if user:
        return jsonify({'message': 'User already exists!'}), 400
    
    # Hash the password
    hashed_password = generate_password_hash(data['password'], method='sha256')
    
    # Create new user
    user_id = execute_query(
        "INSERT INTO users (first_name, last_name, email, password, dob, phone, country) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (data['firstName'], data['lastName'], data['email'], hashed_password, data['dob'], data['phone'], data['country']),
        fetch=False
    )
    
    # Add sample data for the new user
    try:
        # Add sample budget categories
        budget_categories = [
            (user_id, 'Food', 600, 450, '#FF6384'),
            (user_id, 'Utilities', 400, 300, '#36A2EB'),
            (user_id, 'Entertainment', 300, 200, '#FFCE56')
        ]
        
        for category in budget_categories:
            execute_query(
                "INSERT INTO budget_categories (user_id, category, budget, spent, color) VALUES (%s, %s, %s, %s, %s)",
                category,
                fetch=False
            )
        
        # Add sample savings goals
        savings_goals = [
            (user_id, 'Food', 600, 150, '#FF6384'),
            (user_id, 'Utilities', 400, 100, '#36A2EB'),
            (user_id, 'Entertainment', 300, 50, '#FFCE56')
        ]
        
        for goal in savings_goals:
            execute_query(
                "INSERT INTO savings_goals (user_id, category, target, saved, color) VALUES (%s, %s, %s, %s, %s)",
                goal,
                fetch=False
            )
        
        # Add sample transactions
        transactions = [
            (user_id, '2024-01-15', 'Grocery Store', 56.78, 'debit', 'Food', 'Card'),
            (user_id, '2024-01-14', 'Salary Deposit', 2500.00, 'credit', 'Income', 'ACH'),
            (user_id, '2024-01-13', 'Rent Payment', 1200.00, 'debit', 'Housing', 'Check'),
            (user_id, '2024-01-13', 'Gym Membership', 45.90, 'debit', 'Health', 'Card'),
            (user_id, '2024-01-13', 'Online Shopping', 45.90, 'debit', 'Shopping', 'Card')
        ]
        
        for transaction in transactions:
            execute_query(
                "INSERT INTO transactions (user_id, date, description, amount, type, category, method) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                transaction,
                fetch=False
            )
        
        # Add sample subscriptions
        subscriptions = [
            (user_id, 'Netflix', 15.99, 'Monthly', '2024-02-15', 'Entertainment'),
            (user_id, 'Spotify Family', 14.99, 'Monthly', '2024-02-18', 'Entertainment'),
            (user_id, 'Adobe Creative Cloud', 52.99, 'Monthly', '2024-02-20', 'Software'),
            (user_id, 'Amazon Prime', 139.00, 'Yearly', '2024-06-15', 'Shopping'),
            (user_id, 'Gym Membership', 49.99, 'Monthly', '2024-02-01', 'Health')
        ]
        
        for subscription in subscriptions:
            execute_query(
                "INSERT INTO subscriptions (user_id, name, amount, billing_cycle, next_billing, category) VALUES (%s, %s, %s, %s, %s, %s)",
                subscription,
                fetch=False
            )
        
        return jsonify({'message': 'Registration successful!'}), 201
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = execute_query("SELECT * FROM users WHERE email = %s", (data['email'],), fetchone=True)
    
    if not user:
        return jsonify({'message': 'Invalid email or password!'}), 401
    
    if check_password_hash(user['password'], data['password']):
        # Generate JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'firstName': user['first_name'],
                'lastName': user['last_name'],
                'email': user['email']
            }
        }), 200
    
    return jsonify({'message': 'Invalid email or password!'}), 401

@app.route('/api/reset-password', methods=['POST'])
def reset_password_request():
    data = request.get_json()
    
    user = execute_query("SELECT * FROM users WHERE email = %s", (data['email'],), fetchone=True)
    if not user:
        # Don't reveal that the user doesn't exist
        return jsonify({'message': 'Password reset link sent if email exists'}), 200
    
    # Generate reset token
    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, app.config['SECRET_KEY'])
    
    # Store token in the database
    token_expiration = (datetime.datetime.utcnow() + datetime.timedelta(hours=1)).strftime('%Y-%m-%d %H:%M:%S')
    execute_query(
        "UPDATE users SET reset_token = %s, reset_token_expiration = %s WHERE id = %s",
        (token, token_expiration, user['id']),
        fetch=False
    )
    
    # In a real app, send an email with the reset link
    reset_link = f"http://localhost:3000/reset-password/{token}"
    
    return jsonify({'message': 'Password reset link sent', 'resetLink': reset_link}), 200

@app.route('/api/new-password', methods=['POST'])
def set_new_password():
    data = request.get_json()
    token = data['token']
    new_password = data['password']
    
    try:
        # Decode token
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user = execute_query(
            "SELECT * FROM users WHERE id = %s AND reset_token = %s AND reset_token_expiration > NOW()",
            (decoded['user_id'], token),
            fetchone=True
        )
        
        if not user:
            return jsonify({'message': 'Invalid or expired token!'}), 400
        
        # Hash and set new password
        hashed_password = generate_password_hash(new_password, method='sha256')
        execute_query(
            "UPDATE users SET password = %s, reset_token = NULL, reset_token_expiration = NULL WHERE id = %s",
            (hashed_password, user['id']),
            fetch=False
        )
        
        return jsonify({'message': 'Password has been reset!'}), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Transaction APIs
@app.route('/api/transactions', methods=['GET'])
@token_required
def get_transactions(current_user):
    transactions = execute_query(
        "SELECT * FROM transactions WHERE user_id = %s ORDER BY date DESC",
        (current_user['id'],)
    )
    
    result = []
    for t in transactions:
        result.append({
            'id': t['id'],
            'date': t['date'].strftime('%Y-%m-%d'),
            'description': t['description'],
            'amount': t['amount'],
            'type': t['type'],
            'category': t['category'],
            'method': t['method']
        })
    
    return jsonify(result), 200

@app.route('/api/transactions', methods=['POST'])
@token_required
def add_transaction(current_user):
    data = request.get_json()
    
    transaction_id = execute_query(
        "INSERT INTO transactions (user_id, date, description, amount, type, category, method) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (current_user['id'], data['date'], data['description'], data['amount'], data['type'], data['category'], data['method']),
        fetch=False
    )
    
    # Update budget category spent amount if it's a debit transaction
    if data['type'] == 'debit':
        category = execute_query(
            "SELECT * FROM budget_categories WHERE user_id = %s AND category = %s",
            (current_user['id'], data['category']),
            fetchone=True
        )
        
        if category:
            execute_query(
                "UPDATE budget_categories SET spent = spent + %s WHERE id = %s",
                (data['amount'], category['id']),
                fetch=False
            )
    
    return jsonify({'message': 'Transaction added!', 'id': transaction_id}), 201

# Subscription APIs
@app.route('/api/subscriptions', methods=['GET'])
@token_required
def get_subscriptions(current_user):
    subscriptions = execute_query(
        "SELECT * FROM subscriptions WHERE user_id = %s",
        (current_user['id'],)
    )
    
    result = []
    for s in subscriptions:
        result.append({
            'id': s['id'],
            'name': s['name'],
            'amount': s['amount'],
            'billingCycle': s['billing_cycle'],
            'nextBilling': s['next_billing'].strftime('%Y-%m-%d'),
            'category': s['category']
        })
    
    return jsonify(result), 200

@app.route('/api/subscriptions', methods=['POST'])
@token_required
def add_subscription(current_user):
    data = request.get_json()
    
    subscription_id = execute_query(
        "INSERT INTO subscriptions (user_id, name, amount, billing_cycle, next_billing, category) VALUES (%s, %s, %s, %s, %s, %s)",
        (current_user['id'], data['name'], data['amount'], data['billingCycle'], data['nextBilling'], data['category']),
        fetch=False
    )
    
    return jsonify({'message': 'Subscription added!', 'id': subscription_id}), 201

# Budget APIs
@app.route('/api/budget', methods=['GET'])
@token_required
def get_budget(current_user):
    budget_categories = execute_query(
        "SELECT * FROM budget_categories WHERE user_id = %s",
        (current_user['id'],)
    )
    
    result = []
    for bc in budget_categories:
        result.append({
            'id': bc['id'],
            'category': bc['category'],
            'budget': bc['budget'],
            'spent': bc['spent'],
            'color': bc['color']
        })
    
    return jsonify(result), 200

@app.route('/api/budget', methods=['PUT'])
@token_required
def update_budget(current_user):
    data = request.get_json()
    
    # Verify the budget category belongs to the user
    category = execute_query(
        "SELECT * FROM budget_categories WHERE id = %s AND user_id = %s",
        (data['id'], current_user['id']),
        fetchone=True
    )
    
    if not category:
        return jsonify({'message': 'Category not found!'}), 404
    
    execute_query(
        "UPDATE budget_categories SET budget = %s, spent = %s WHERE id = %s",
        (data['budget'], data['spent'], data['id']),
        fetch=False
    )
    
    return jsonify({'message': 'Budget updated!'}), 200

# Goals APIs
@app.route('/api/goals', methods=['GET'])
@token_required
def get_goals(current_user):
    savings_goals = execute_query(
        "SELECT * FROM savings_goals WHERE user_id = %s",
        (current_user['id'],)
    )
    
    result = []
    for sg in savings_goals:
        result.append({
            'id': sg['id'],
            'category': sg['category'],
            'target': sg['target'],
            'saved': sg['saved'],
            'color': sg['color']
        })
    
    return jsonify(result), 200

@app.route('/api/goals', methods=['PUT'])
@token_required
def update_goal(current_user):
    data = request.get_json()
    
    # Verify the goal belongs to the user
    goal = execute_query(
        "SELECT * FROM savings_goals WHERE id = %s AND user_id = %s",
        (data['id'], current_user['id']),
        fetchone=True
    )
    
    if not goal:
        return jsonify({'message': 'Goal not found!'}), 404
    
    execute_query(
        "UPDATE savings_goals SET target = %s, saved = %s WHERE id = %s",
        (data['target'], data['saved'], data['id']),
        fetch=False
    )
    
    return jsonify({'message': 'Goal updated!'}), 200

# User Profile APIs
@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        'id': current_user['id'],
        'firstName': current_user['first_name'],
        'lastName': current_user['last_name'],
        'email': current_user['email'],
        'dob': current_user['dob'],
        'phone': current_user['phone'],
        'country': current_user['country']
    }), 200

@app.route('/api/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    
    execute_query(
        "UPDATE users SET first_name = %s, last_name = %s, phone = %s, country = %s WHERE id = %s",
        (
            data.get('firstName', current_user['first_name']),
            data.get('lastName', current_user['last_name']),
            data.get('phone', current_user['phone']),
            data.get('country', current_user['country']),
            current_user['id']
        ),
        fetch=False
    )
    
    return jsonify({'message': 'Profile updated!'}), 200

# Import plaid integration functions (we'll implement this later)
from plaid_integration import (
    create_link_token, exchange_public_token, get_accounts, 
    get_transactions, format_transaction_data, get_spending_by_category,
    get_recent_transactions
)

# Plaid API endpoints
@app.route('/api/plaid/create_link_token', methods=['GET'])
@token_required
def get_link_token(current_user):
    try:
        response = create_link_token(current_user['id'])
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/plaid/exchange_public_token', methods=['POST'])
@token_required
def handle_exchange_public_token(current_user):
    data = request.get_json()
    public_token = data.get('public_token')
    institution_id = data.get('institution_id')
    institution_name = data.get('institution_name')
    
    try:
        # Exchange public token for access token
        exchange_response = exchange_public_token(public_token)
        access_token = exchange_response['access_token']
        item_id = exchange_response['item_id']
        
        # Save to database
        plaid_item_id = execute_query(
            "INSERT INTO plaid_items (user_id, item_id, access_token, institution_id, institution_name) VALUES (%s, %s, %s, %s, %s)",
            (current_user['id'], item_id, access_token, institution_id, institution_name),
            fetch=False
        )
        
        # Get accounts
        accounts_response = get_accounts(access_token)
        accounts = accounts_response['accounts']
        
        # Save accounts to database
        for account in accounts:
            execute_query(
                """INSERT INTO plaid_accounts 
                   (plaid_item_id, account_id, name, mask, type, subtype, current_balance, available_balance) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    plaid_item_id,
                    account['account_id'],
                    account['name'],
                    account.get('mask'),
                    account['type'],
                    account.get('subtype'),
                    account.get('balances', {}).get('current'),
                    account.get('balances', {}).get('available')
                ),
                fetch=False
            )
        
        # Get initial transactions
        end_date = datetime.datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%Y-%m-%d')
        
        transaction_data = get_transactions(access_token, start_date, end_date)
        formatted_transactions = format_transaction_data(transaction_data['transactions'], current_user['id'])
        
        # Save transactions to database
        for transaction_data in formatted_transactions:
            # Find the account ID
            account = execute_query(
                "SELECT id FROM plaid_accounts WHERE plaid_item_id = %s AND account_id = %s",
                (plaid_item_id, transaction_data.get('account_id')),
                fetchone=True
            )
            
            account_id = account['id'] if account else None
            
            execute_query(
                """INSERT INTO transactions 
                   (user_id, plaid_account_id, plaid_transaction_id, date, description, amount, type, category, method, is_pending, location) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    current_user['id'],
                    account_id,
                    transaction_data.get('plaid_transaction_id'),
                    transaction_data['date'],
                    transaction_data['description'],
                    transaction_data['amount'],
                    transaction_data['type'],
                    transaction_data['category'],
                    transaction_data['method'],
                    transaction_data.get('is_pending', False),
                    transaction_data.get('location')
                ),
                fetch=False
            )
        
        return jsonify({
            'message': 'Bank account linked successfully!',
            'item_id': plaid_item_id
        }), 200
    
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/plaid/accounts', methods=['GET'])
@token_required
def get_plaid_accounts(current_user):
    try:
        accounts = []
        plaid_items = execute_query(
            "SELECT * FROM plaid_items WHERE user_id = %s",
            (current_user['id'],)
        )
        
        for item in plaid_items:
            plaid_accounts = execute_query(
                "SELECT * FROM plaid_accounts WHERE plaid_item_id = %s",
                (item['id'],)
            )
            
            for account in plaid_accounts:
                accounts.append({
                    'id': account['id'],
                    'name': account['name'],
                    'mask': account['mask'],
                    'type': account['type'],
                    'subtype': account['subtype'],
                    'current_balance': account['current_balance'],
                    'available_balance': account['available_balance'],
                    'institution_name': item['institution_name']
                })
        
        return jsonify(accounts), 200
    
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/plaid/transactions/refresh', methods=['POST'])
@token_required
def refresh_transactions(current_user):
    try:
        # Get all Plaid items for the user
        plaid_items = execute_query(
            "SELECT * FROM plaid_items WHERE user_id = %s",
            (current_user['id'],)
        )
        
        for item in plaid_items:
            access_token = item['access_token']
            
            # Get transactions from the last 30 days
            end_date = datetime.datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%Y-%m-%d')
            
            transaction_data = get_transactions(access_token, start_date, end_date)
            formatted_transactions = format_transaction_data(transaction_data['transactions'], current_user['id'])
            
            # Store new transactions
            for transaction_data in formatted_transactions:
                # Check if transaction already exists
                existing_transaction = execute_query(
                    "SELECT * FROM transactions WHERE plaid_transaction_id = %s",
                    (transaction_data.get('plaid_transaction_id'),),
                    fetchone=True
                )
                
                if not existing_transaction:
                    # Find the account ID
                    account = execute_query(
                        "SELECT id FROM plaid_accounts WHERE plaid_item_id = %s AND account_id = %s",
                        (item['id'], transaction_data.get('account_id')),
                        fetchone=True
                    )
                    
                    account_id = account['id'] if account else None
                    
                    execute_query(
                        """INSERT INTO transactions 
                           (user_id, plaid_account_id, plaid_transaction_id, date, description, amount, type, category, method, is_pending, location) 
                           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                        (
                            current_user['id'],
                            account_id,
                            transaction_data.get('plaid_transaction_id'),
                            transaction_data['date'],
                            transaction_data['description'],
                            transaction_data['amount'],
                            transaction_data['type'],
                            transaction_data['category'],
                            transaction_data['method'],
                            transaction_data.get('is_pending', False),
                            transaction_data.get('location')
                        ),
                        fetch=False
                    )
        
        return jsonify({'message': 'Transactions refreshed successfully!'}), 200
    
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/api/plaid/spending_by_category', methods=['GET'])
@token_required
def get_plaid_spending_by_category(current_user):
    try:
        # Get date range from query params
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date:
            start_date = (datetime.datetime.now() - datetime.timedelta(days=30)).strftime('%Y-%m-%d')
        
        if not end_date:
            end_date = datetime.datetime.now().strftime('%Y-%m-%d')
        
        # Get all Plaid items for the user
        plaid_items = execute_query(
            "SELECT * FROM plaid_items WHERE user_id = %s",
            (current_user['id'],)
        )
        
        all_categories = {}
        
        for item in plaid_items:
            access_token = item['access_token']
            categories = get_spending_by_category(access_token, start_date, end_date)
            
            for category in categories:
                cat_name = category['category']
                amount = category['amount']
                
                if cat_name in all_categories:
                    all_categories[cat_name] += amount
                else:
                    all_categories[cat_name] = amount
        
        # Format for frontend display
        result = []
        for category, amount in all_categories.items():
            result.append({
                'category': category,
                'amount': amount
            })
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500


##LLM APIs###
# Configure OpenAI API
openai.api_key = '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' 


# Initialize advisor endpoint tables
def ensure_advisor_tables():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Create advisor_recommendations table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS advisor_recommendations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            recommendation_type VARCHAR(50) NOT NULL,
            title VARCHAR(200) NOT NULL,
            content TEXT NOT NULL,
            action_items TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        ''')

        connection.commit()
    except Exception as e:
        print(f"Error ensuring advisor tables: {e}")
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


# Primary financial advisor endpoint that calls a real LLM
@app.route('/api/advisor', methods=['POST'])
@token_required
def get_advisor_recommendations(current_user):
    ensure_advisor_tables()  # Make sure tables exist
    
    try:
        data = request.get_json()
        focus_area = data.get('focus_area', 'all')  # Optional focus area
        time_horizon = data.get('time_horizon', 'short')  # short, medium, long
        risk_tolerance = data.get('risk_tolerance', 'moderate')  # low, moderate, high
        
        # Gather comprehensive financial data for the user
        user_id = current_user['id']
        financial_data = gather_user_financial_data(user_id)
        
        # Call the LLM API to generate personalized recommendations
        recommendations = call_llm_for_advice(
            financial_data, 
            focus_area, 
            time_horizon, 
            risk_tolerance, 
            current_user['first_name']
        )
        
        # Save recommendations to database
        for rec in recommendations:
            insert_query = """
            INSERT INTO advisor_recommendations 
            (user_id, recommendation_type, title, content, action_items)
            VALUES (%s, %s, %s, %s, %s)
            """
            execute_query(
                insert_query, 
                (user_id, rec['type'], rec['title'], rec['content'], json.dumps(rec['action_items'])),
                fetch=False
            )
        
        return jsonify({
            "financial_summary": financial_data,
            "recommendations": recommendations,
            "generated_at": datetime.now().isoformat()
        }), 200
    
    except Exception as e:
        print(f"Error generating advisor recommendations: {e}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Function to gather user's financial data
def gather_user_financial_data(user_id):
    # Get account balances
    balance_query = """
    SELECT 
        COALESCE(SUM(CASE WHEN pa.type != 'credit' THEN pa.current_balance ELSE 0 END), 0) as total_assets,
        COALESCE(SUM(CASE WHEN pa.type = 'credit' THEN pa.current_balance ELSE 0 END), 0) as total_debt,
        COUNT(DISTINCT pi.id) as connected_institutions
    FROM plaid_accounts pa
    JOIN plaid_items pi ON pa.plaid_item_id = pi.id
    WHERE pi.user_id = %s
    """
    balance_result = execute_query(balance_query, (user_id,), fetchone=True)
    
    total_assets = balance_result['total_assets'] if balance_result else 0
    total_debt = balance_result['total_debt'] if balance_result else 0
    net_worth = total_assets - total_debt
    
    # Get transaction summary for last 3 months
    three_months_ago = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
    transaction_query = """
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as total_expenses,
        COUNT(*) as transaction_count
    FROM transactions
    WHERE user_id = %s AND date >= %s
    """
    transaction_result = execute_query(transaction_query, (user_id, three_months_ago), fetchone=True)
    
    total_income = transaction_result['total_income'] if transaction_result else 0
    total_expenses = transaction_result['total_expenses'] if transaction_result else 0
    monthly_income = total_income / 3  # Average monthly income
    monthly_expenses = total_expenses / 3  # Average monthly expenses
    monthly_cash_flow = monthly_income - monthly_expenses
    
    # Get spending by category
    category_query = """
    SELECT category, SUM(amount) as category_total
    FROM transactions
    WHERE user_id = %s AND type = 'debit' AND date >= %s
    GROUP BY category
    ORDER BY category_total DESC
    """
    spending_by_category = execute_query(category_query, (user_id, three_months_ago))
    
    # Get budget information
    budget_query = """
    SELECT 
        COALESCE(SUM(budget), 0) as total_budget,
        COALESCE(SUM(spent), 0) as total_spent,
        COUNT(*) as budget_category_count
    FROM budget_categories
    WHERE user_id = %s
    """
    budget_result = execute_query(budget_query, (user_id,), fetchone=True)
    
    has_budget = budget_result and budget_result['budget_category_count'] > 0
    
    # Get budget categories
    budget_categories_query = """
    SELECT category, budget, spent, budget - spent as remaining
    FROM budget_categories
    WHERE user_id = %s
    ORDER BY spent DESC
    """
    budget_categories = execute_query(budget_categories_query, (user_id,))
    
    # Get savings goals
    goals_query = """
    SELECT 
        COALESCE(SUM(target), 0) as total_targets,
        COALESCE(SUM(saved), 0) as total_saved,
        COUNT(*) as goal_count
    FROM savings_goals
    WHERE user_id = %s
    """
    goals_result = execute_query(goals_query, (user_id,), fetchone=True)
    
    has_goals = goals_result and goals_result['goal_count'] > 0
    goals_progress = 0
    if goals_result and goals_result['total_targets'] > 0:
        goals_progress = (goals_result['total_saved'] / goals_result['total_targets']) * 100
    
    # Get individual goals
    goals_detail_query = """
    SELECT category, target, saved, target - saved as remaining
    FROM savings_goals
    WHERE user_id = %s
    """
    goals_details = execute_query(goals_detail_query, (user_id,))
    
    # Get subscription information
    subscription_query = """
    SELECT 
        COALESCE(SUM(CASE WHEN billing_cycle = 'Monthly' THEN amount ELSE amount/12 END), 0) as monthly_subscription_cost,
        COUNT(*) as subscription_count
    FROM subscriptions
    WHERE user_id = %s
    """
    subscription_result = execute_query(subscription_query, (user_id,), fetchone=True)
    
    monthly_subscription_cost = subscription_result['monthly_subscription_cost'] if subscription_result else 0
    
    # Get subscription details
    subscriptions_detail_query = """
    SELECT name, amount, billing_cycle, next_billing
    FROM subscriptions
    WHERE user_id = %s
    ORDER BY amount DESC
    """
    subscriptions_details = execute_query(subscriptions_detail_query, (user_id,))
    
    # Calculate key financial ratios
    savings_rate = 0
    if monthly_income > 0:
        savings_rate = (monthly_income - monthly_expenses) / monthly_income * 100
    
    debt_to_income = 0
    if monthly_income > 0:
        debt_to_income = total_debt / monthly_income
    
    debt_to_asset = 0
    if total_assets > 0:
        debt_to_asset = total_debt / total_assets
    
    # Subscription to income ratio
    subscription_to_income = 0
    if monthly_income > 0:
        subscription_to_income = monthly_subscription_cost / monthly_income * 100
    
    # Format categories for better readability
    formatted_categories = []
    for cat in spending_by_category:
        formatted_categories.append({
            "category": cat["category"],
            "amount": cat["category_total"]
        })
    
    # Format budget categories
    formatted_budget = []
    for budget in budget_categories:
        if budget['budget'] > 0:
            percent_used = (budget['spent'] / budget['budget']) * 100
        else:
            percent_used = 0
            
        formatted_budget.append({
            "category": budget["category"],
            "budget": budget["budget"],
            "spent": budget["spent"],
            "remaining": budget["remaining"],
            "percent_used": percent_used
        })
    
    # Format goals
    formatted_goals = []
    for goal in goals_details:
        if goal['target'] > 0:
            percent_complete = (goal['saved'] / goal['target']) * 100
        else:
            percent_complete = 0
            
        formatted_goals.append({
            "category": goal["category"],
            "target": goal["target"],
            "saved": goal["saved"],
            "remaining": goal["remaining"],
            "percent_complete": percent_complete
        })
    
    # Format subscriptions
    formatted_subscriptions = []
    for sub in subscriptions_details:
        formatted_subscriptions.append({
            "name": sub["name"],
            "amount": sub["amount"],
            "billing_cycle": sub["billing_cycle"],
            "next_billing": sub["next_billing"].strftime('%Y-%m-%d') if sub["next_billing"] else None
        })
    
    # Prepare financial data object
    financial_data = {
        "net_worth": net_worth,
        "total_assets": total_assets,
        "total_debt": total_debt,
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "monthly_cash_flow": monthly_cash_flow,
        "savings_rate": savings_rate,
        "debt_to_income": debt_to_income,
        "debt_to_asset": debt_to_asset,
        "has_budget": has_budget,
        "has_goals": has_goals,
        "goals_progress": goals_progress,
        "subscription_to_income": subscription_to_income,
        "top_expense_categories": formatted_categories[:5],
        "budget_categories": formatted_budget,
        "savings_goals": formatted_goals,
        "subscriptions": formatted_subscriptions
    }
    
    return financial_data

# Function to call OpenAI API for financial advice
def call_llm_for_advice(financial_data, focus_area, time_horizon, risk_tolerance, user_name):
    try:
        # Convert financial data to a structured, readable format for the LLM
        data_for_llm = format_financial_data_for_llm(financial_data)
        
        # Prepare system prompt
        system_prompt = """
You are a professional financial advisor providing personalized financial advice. 
Your recommendations should be specific, actionable, and tailored to the user's financial situation.
Analyze the provided financial data and generate structured recommendations with the following format:

1. Each recommendation should be a JSON object with these fields:
   - "type": The category of advice (e.g., "emergency_fund", "debt_reduction", "budget_optimization")
   - "title": A concise, descriptive title
   - "content": Detailed explanation of the recommendation (2-3 sentences)
   - "action_items": An array of 3-5 specific, actionable steps
   - "priority": "high", "medium", or "low" based on urgency

2. Focus on practical advice that addresses the user's most pressing financial needs.

3. Base your recommendations on widely accepted financial principles:
   - Emergency fund of 3-6 months of expenses
   - Debt-to-income ratio below 36%
   - Saving 15-20% of income
   - Diversified investments based on time horizon and risk tolerance
"""

        # Prepare user prompt based on focus area
        if focus_area.lower() == 'all':
            user_prompt = f"""
Based on the financial data provided for {user_name}, generate 3-5 comprehensive financial recommendations covering their most important needs.

Time Horizon: {time_horizon}
Risk Tolerance: {risk_tolerance}

Financial Data:
{data_for_llm}

Return your recommendations as a JSON array, with each object having the structure described in your instructions.
"""
        else:
            user_prompt = f"""
Based on the financial data provided for {user_name}, generate 1-2 focused financial recommendations specifically for their "{focus_area}" area.

Time Horizon: {time_horizon}
Risk Tolerance: {risk_tolerance}

Financial Data:
{data_for_llm}

Return your recommendations as a JSON array, with each object having the structure described in your instructions.
"""

        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4",  # or "gpt-3.5-turbo" for a less expensive option
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.5,  # Lower temperature for more consistent, factual output
            max_tokens=2000
        )
        
        # Extract and parse the JSON response
        response_text = response.choices[0].message.content.strip()
        
        # Extract JSON content (handle cases where LLM might wrap the JSON in explanation)
        try:
            # Try to parse the entire response as JSON
            recommendations = json.loads(response_text)
        except json.JSONDecodeError:
            # If that fails, try to extract JSON array using regex
            import re
            json_match = re.search(r'\[[\s\S]*\]', response_text)
            if json_match:
                recommendations = json.loads(json_match.group(0))
            else:
                # If all else fails, return a default recommendation
                recommendations = [{
                    "type": "general_advice",
                    "title": "Financial Health Check",
                    "content": "Based on your financial data, I've analyzed your situation but encountered an issue formatting the response. Here are some general recommendations.",
                    "action_items": [
                        "Review your budget to ensure expenses are less than income",
                        "Build an emergency fund of 3-6 months of expenses",
                        "Pay down high-interest debt",
                        "Save at least 15-20% of your income"
                    ],
                    "priority": "medium"
                }]
        
        return recommendations
    
    except Exception as e:
        print(f"Error calling LLM API: {e}")
        # Return a fallback recommendation
        return [{
            "type": "error_fallback",
            "title": "Financial Health Check",
            "content": "I encountered an issue generating personalized recommendations. Here are some general financial principles to consider.",
            "action_items": [
                "Create a budget that ensures your expenses are less than your income",
                "Build an emergency fund of 3-6 months of expenses",
                "Pay down high-interest debt as a priority",
                "Save at least 15-20% of your income for long-term goals"
            ],
            "priority": "medium"
        }]

# Format financial data into a readable format for the LLM
def format_financial_data_for_llm(data):
    result = f"""
FINANCIAL SUMMARY:
Net Worth: ${data['net_worth']:.2f}
Total Assets: ${data['total_assets']:.2f}
Total Debt: ${data['total_debt']:.2f}

MONTHLY CASH FLOW:
Income: ${data['monthly_income']:.2f}/month
Expenses: ${data['monthly_expenses']:.2f}/month
Net Cash Flow: ${data['monthly_cash_flow']:.2f}/month
Savings Rate: {data['savings_rate']:.1f}%

KEY RATIOS:
Debt-to-Income: {data['debt_to_income']:.2f} (recommended: below 0.36)
Debt-to-Asset: {data['debt_to_asset']:.2f}
Subscription-to-Income: {data['subscription_to_income']:.1f}%

BUDGET INFORMATION:
Has Budget: {data['has_budget']}
"""

    if data['budget_categories']:
        result += "\nBUDGET CATEGORIES:\n"
        for category in data['budget_categories']:
            result += f"- {category['category']}: ${category['spent']:.2f} of ${category['budget']:.2f} ({category['percent_used']:.1f}%)\n"

    result += f"\nSAVINGS GOALS INFORMATION:\nHas Goals: {data['has_goals']}\nOverall Progress: {data['goals_progress']:.1f}%\n"

    if data['savings_goals']:
        result += "\nSAVINGS GOALS:\n"
        for goal in data['savings_goals']:
            result += f"- {goal['category']}: ${goal['saved']:.2f} of ${goal['target']:.2f} ({goal['percent_complete']:.1f}%)\n"

    if data['top_expense_categories']:
        result += "\nTOP EXPENSE CATEGORIES (last 3 months):\n"
        for category in data['top_expense_categories']:
            result += f"- {category['category']}: ${category['amount']:.2f}\n"

    if data['subscriptions']:
        result += "\nACTIVE SUBSCRIPTIONS:\n"
        for sub in data['subscriptions']:
            result += f"- {sub['name']}: ${sub['amount']:.2f} ({sub['billing_cycle']})\n"

    return result



@app.route('/api/education/personalized', methods=['GET'])
@token_required
def get_personalized_education(current_user):
    try:
        # Gather recent transactions and financial behavior
        transactions_query = """
        SELECT category, type, amount, date
        FROM transactions
        WHERE user_id = %s
        ORDER BY date DESC LIMIT 100
        """
        recent_transactions = execute_query(transactions_query, (current_user['id'],))

        # Get user profile data for context
        profile_data = {
            "name": current_user['first_name'],
            "recent_activity": [
                {
                    "category": t['category'],
                    "type": t['type'],
                    "amount": t['amount'],
                    "date": t['date'].strftime('%Y-%m-%d')
                } for t in recent_transactions
            ]
        }

        # Identify knowledge gaps based on spending patterns
        knowledge_areas = identify_knowledge_gaps(profile_data)

        # Generate educational content with LLM
        system_prompt = """
        You are a financial education expert. Create personalized financial education content
        based on the user's recent financial activity. Identify potential knowledge gaps and
        provide tailored educational content that would be most relevant to their situation.

        Your response should include:
        1. A short introduction explaining why this topic is relevant to them
        2. 3-5 key educational points about the topic
        3. A practical next step they can take to apply this knowledge
        """

        user_prompt = f"""
        Based on this user's recent financial activity:
        {json.dumps(profile_data, indent=2)}

        And these identified potential knowledge areas:
        {', '.join(knowledge_areas)}

        Create a personalized educational module on the most relevant topic.
        Make your response conversational and accessible, avoiding unnecessary jargon.
        """

        educational_content = call_llm(system_prompt, user_prompt)

        return jsonify({
            "educational_content": educational_content,
            "suggested_topics": knowledge_areas
        }), 200

    except Exception as e:
        print(f"Error generating personalized education: {e}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Helper function to identify knowledge gaps
def identify_knowledge_gaps(profile_data):
    # Analyze transaction patterns to identify potential educational needs
    knowledge_areas = []

    # Check for investment activity
    investment_categories = ["investments", "stocks", "retirement"]
    has_investments = any(t['category'].lower() in investment_categories for t in profile_data['recent_activity'])
    if not has_investments:
        knowledge_areas.append("Investment basics")

    # Check for debt payments
    debt_categories = ["credit card payment", "loan payment", "debt"]
    has_debt = any(t['category'].lower() in debt_categories for t in profile_data['recent_activity'])
    if has_debt:
        knowledge_areas.append("Debt management strategies")

    # Check for large purchases
    large_purchases = [t for t in profile_data['recent_activity'] if t['amount'] > 500]
    if large_purchases:
        knowledge_areas.append("Major purchase planning")

    # Add other basic financial literacy topics
    knowledge_areas.extend([
        "Budgeting fundamentals",
        "Emergency fund basics",
        "Credit score improvement",
        "Tax optimization strategies"
    ])

    return knowledge_areas

@app.route('/api/advisor/simulate-decision', methods=['POST'])
@token_required
def simulate_financial_decision(current_user):
    try:
        data = request.get_json()
        decision_type = data.get('decision_type', '')  # e.g., "purchase", "investment", "loan"
        decision_details = data.get('details', {})
        time_horizon = data.get('time_horizon', 'medium')  # short, medium, long

        # Get user's current financial status
        financial_data = gather_user_financial_data(current_user['id'])

        # Format the decision for the LLM
        decision_description = format_decision_for_simulation(decision_type, decision_details)

        # Create system prompt for the LLM
        system_prompt = """
        You are a financial advisor simulating the impact of potential financial decisions.
        Analyze the user's current financial situation and the proposed financial decision.
        Provide a realistic assessment of how this decision would impact their financial health
        in the short and long term.

        Your response should include:
        1. A summary of the decision and its immediate financial impact
        2. Short-term impacts (next 1-12 months) on budget, cash flow, and savings
        3. Long-term impacts (1+ years) on financial goals and net worth
        4. Alternative scenarios or modifications to improve outcomes
        5. A clear recommendation (proceed, modify, or reconsider)

        Be specific, quantitative, and realistic in your assessment.
        """

        # Create user prompt for the LLM
        user_prompt = f"""
        The user {current_user['first_name']} is considering this financial decision:
        {decision_description}

        Time horizon: {time_horizon}

        Their current financial situation:
        Monthly Income: ${financial_data['monthly_income']:.2f}
        Monthly Expenses: ${financial_data['monthly_expenses']:.2f}
        Net Worth: ${financial_data['net_worth']:.2f}
        Debt-to-Income Ratio: {financial_data['debt_to_income']:.2f}
        Savings Rate: {financial_data['savings_rate']:.1f}%

        Monthly Cash Flow: ${financial_data['monthly_cash_flow']:.2f}

        Analyze the impact of this decision on their financial health and provide your assessment.
        """

        # Call OpenAI API for simulation
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.5,
            max_tokens=2000
        )

        simulation_result = response.choices[0].message.content.strip()

        # Save simulation to history
        save_simulation_history(current_user['id'], decision_type, decision_details, simulation_result)

        return jsonify({
            "decision": {
                "type": decision_type,
                "details": decision_details
            },
            "current_financial_snapshot": {
                "monthly_income": financial_data['monthly_income'],
                "monthly_expenses": financial_data['monthly_expenses'],
                "monthly_cash_flow": financial_data['monthly_cash_flow'],
                "net_worth": financial_data['net_worth']
            },
            "simulation_result": simulation_result
        }), 200

    except Exception as e:
        print(f"Error simulating financial decision: {e}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

# Helper function to format the decision for simulation
def format_decision_for_simulation(decision_type, details):
    if decision_type == "purchase":
        return f"Purchase of {details.get('item', 'an item')} costing ${details.get('cost', 0):.2f}. " + \
               f"Payment method: {details.get('payment_method', 'cash')}. " + \
               (f"Financing terms: {details.get('financing_terms', 'N/A')}." if details.get('payment_method') == 'financing' else "")

    elif decision_type == "investment":
        return f"Investment of ${details.get('amount', 0):.2f} in {details.get('investment_type', 'an investment')}. " + \
               f"Expected return: {details.get('expected_return', '?')}%. " + \
               f"Risk level: {details.get('risk_level', 'moderate')}."

    elif decision_type == "loan":
        return f"Loan of ${details.get('amount', 0):.2f} for {details.get('purpose', 'general purposes')}. " + \
               f"Interest rate: {details.get('interest_rate', 0)}%. " + \
               f"Term: {details.get('term', '?')} {details.get('term_unit', 'years')}. " + \
               f"Monthly payment: ${details.get('monthly_payment', 0):.2f}."

    else:
        return f"Financial decision: {decision_type}. Details: {json.dumps(details)}"

# Helper function to save simulation history
def save_simulation_history(user_id, decision_type, decision_details, simulation_result):
    try:
        # Create table if it doesn't exist
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS decision_simulations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            decision_type VARCHAR(50) NOT NULL,
            decision_details TEXT NOT NULL,
            simulation_result TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        ''')

        # Save the simulation
        cursor.execute(
            "INSERT INTO decision_simulations (user_id, decision_type, decision_details, simulation_result) VALUES (%s, %s, %s, %s)",
            (user_id, decision_type, json.dumps(decision_details), simulation_result)
        )

        connection.commit()
        cursor.close()
        connection.close()

    except Exception as e:
        print(f"Error saving simulation history: {e}")

# Initialize database when the app starts
with app.app_context():
    init_db()

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')
