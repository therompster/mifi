# seed_data.py
from app import app, db, User, Transaction, BudgetCategory, SavingsGoal, Subscription
from werkzeug.security import generate_password_hash
import datetime

def seed_database():
    with app.app_context():
        # Clear the database
        db.drop_all()
        db.create_all()
        
        # Create a demo user
        demo_user = User(
            first_name='Jessica',
            last_name='Harper',
            email='jessica.harper@example.com',
            password=generate_password_hash('password123', method='sha256'),
            dob='1995-05-15',
            phone='123-456-7890',
            country='USA'
        )
        
        db.session.add(demo_user)
        db.session.commit()
        
        # Add budget categories
        budget_categories = [
            BudgetCategory(category='Food', budget=600, spent=450, color='#FF6384', user=demo_user),
            BudgetCategory(category='Utilities', budget=400, spent=300, color='#36A2EB', user=demo_user),
            BudgetCategory(category='Entertainment', budget=300, spent=200, color='#FFCE56', user=demo_user),
            BudgetCategory(category='Housing', budget=1200, spent=1200, color='#4BC0C0', user=demo_user),
            BudgetCategory(category='Transportation', budget=250, spent=220, color='#9966FF', user=demo_user),
            BudgetCategory(category='Travel', budget=300, spent=250, color='#FF9F40', user=demo_user)
        ]
        
        db.session.add_all(budget_categories)
        
        # Add savings goals
        savings_goals = [
            SavingsGoal(category='Emergency Fund', target=5000, saved=2500, color='#FF6384', user=demo_user),
            SavingsGoal(category='Vacation', target=1500, saved=800, color='#36A2EB', user=demo_user),
            SavingsGoal(category='New Car', target=10000, saved=3000, color='#FFCE56', user=demo_user)
        ]
        
        db.session.add_all(savings_goals)
        
        # Add transactions
        transactions = [
            Transaction(
                date=datetime.datetime.strptime('2024-01-15', '%Y-%m-%d'),
                description='Grocery Store',
                amount=56.78,
                type='debit',
                category='Food',
                method='Card',
                user=demo_user
            ),
            Transaction(
                date=datetime.datetime.strptime('2024-01-14', '%Y-%m-%d'),
                description='Salary Deposit',
                amount=2500.00,
                type='credit',
                category='Income',
                method='ACH',
                user=demo_user
            ),
            Transaction(
                date=datetime.datetime.strptime('2024-01-13', '%Y-%m-%d'),
                description='Rent Payment',
                amount=1200.00,
                type='debit',
                category='Housing',
                method='Check',
                user=demo_user
            ),
            Transaction(
                date=datetime.datetime.strptime('2024-01-13', '%Y-%m-%d'),
                description='Gym Membership',
                amount=45.90,
                type='debit',
                category='Health',
                method='Card',
                user=demo_user
            ),
            Transaction(
                date=datetime.datetime.strptime('2024-01-13', '%Y-%m-%d'),
                description='Online Shopping',
                amount=45.90,
                type='debit',
                category='Shopping',
                method='Card',
                user=demo_user
            ),
            Transaction(
                date=datetime.datetime.strptime('2024-01-12', '%Y-%m-%d'),
                description='Gas Station',
                amount=35.50,
                type='debit',
                category='Transportation',
                method='Card',
                user=demo_user
            ),
            Transaction(
                date=datetime.datetime.strptime('2024-01-11', '%Y-%m-%d'),
                description='Restaurant',
                amount=78.90,
                type='debit',
                category='Food',
                method='Card',
                user=demo_user
            ),
            Transaction(
                date=datetime.datetime.strptime('2024-01-10', '%Y-%m-%d'),
                description='Electric Bill',
                amount=85.20,
                type='debit',
                category='Utilities',
                method='ACH',
                user=demo_user
            ),
            Transaction(
                date=datetime.datetime.strptime('2024-01-09', '%Y-%m-%d'),
                description='Movie Tickets',
                amount=32.00,
                type='debit',
                category='Entertainment',
                method='Card',
                user=demo_user
            ),
            Transaction(
                date=datetime.datetime.strptime('2024-01-08', '%Y-%m-%d'),
                description='Side Gig Payment',
                amount=150.00,
                type='credit',
                category='Income',
                method='ACH',
                user=demo_user
            )
        ]
        
        db.session.add_all(transactions)
        
        # Add subscriptions
        subscriptions = [
            Subscription(
                name='Netflix',
                amount=15.99,
                billing_cycle='Monthly',
                next_billing=datetime.datetime.strptime('2024-02-15', '%Y-%m-%d'),
                category='Entertainment',
                user=demo_user
            ),
            Subscription(
                name='Spotify Family',
                amount=14.99,
                billing_cycle='Monthly',
                next_billing=datetime.datetime.strptime('2024-02-18', '%Y-%m-%d'),
                category='Entertainment',
                user=demo_user
            ),
            Subscription(
                name='Adobe Creative Cloud',
                amount=52.99,
                billing_cycle='Monthly',
                next_billing=
