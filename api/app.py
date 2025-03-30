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
import json

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
        
        # Add foreign key to transactions for plaid_account_id
        cursor.execute('''
        ALTER TABLE transactions
        ADD CONSTRAINT IF NOT EXISTS fk_transactions_plaid_account
        FOREIGN KEY (plaid_account_id) REFERENCES plaid_accounts(id)
        ''')
        
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
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
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

# Initialize database when the app starts
with app.app_context():
    init_db()

if __name__ == '__main__':
    app.run(debug=True)
