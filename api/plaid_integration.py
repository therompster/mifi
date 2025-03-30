# plaid_integration.py
import plaid
from plaid.model.country_code import CountryCode
from plaid.model.products import Products
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.api import plaid_api
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from datetime import datetime, timedelta
import os
from flask import current_app
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def configure_plaid():
    # Configuration for the Plaid client
    configuration = plaid.Configuration(
        host=plaid.Environment.Sandbox,  # Change to Development or Production in real environments
        api_key={
            'clientId': os.getenv('PLAID_CLIENT_ID'),
            'secret': os.getenv('PLAID_SECRET'),
        }
    )
    
    api_client = plaid.ApiClient(configuration)
    client = plaid_api.PlaidApi(api_client)
    
    return client

def create_link_token(user_id):
    client = configure_plaid()
    
    # Create a link token for the given user
    request = LinkTokenCreateRequest(
        user=LinkTokenCreateRequestUser(
            client_user_id=str(user_id)
        ),
        client_name="IFi Finance App",
        products=[Products("transactions"), Products("auth")],
        country_codes=[CountryCode("US")],
        language="en"
    )
    
    response = client.link_token_create(request)
    return response.to_dict()

def exchange_public_token(public_token):
    client = configure_plaid()
    
    # Exchange the public token for an access token
    exchange_request = ItemPublicTokenExchangeRequest(public_token=public_token)
    exchange_response = client.item_public_token_exchange(exchange_request)
    
    # Return the access token and item ID
    return {
        'access_token': exchange_response['access_token'],
        'item_id': exchange_response['item_id']
    }

def get_accounts(access_token):
    client = configure_plaid()
    
    # Get accounts for the user
    request = AccountsGetRequest(access_token=access_token)
    response = client.accounts_get(request)
    
    return response.to_dict()

def get_transactions(access_token, start_date, end_date):
    client = configure_plaid()
    
    # Get transactions for the user within the date range
    request = TransactionsGetRequest(
        access_token=access_token,
        start_date=start_date,
        end_date=end_date,
        options=TransactionsGetRequestOptions(
            count=100  # Number of transactions to fetch
        )
    )
    
    response = client.transactions_get(request)
    transactions = response['transactions']
    
    # Fetch all available transactions
    while len(transactions) < response['total_transactions']:
        request = TransactionsGetRequest(
            access_token=access_token,
            start_date=start_date,
            end_date=end_date,
            options=TransactionsGetRequestOptions(
                count=100,
                offset=len(transactions)
            )
        )
        response = client.transactions_get(request)
        transactions.extend(response['transactions'])
    
    return {
        'accounts': response['accounts'],
        'transactions': transactions
    }

def format_transaction_data(plaid_transactions, user_id):
    """
    Format Plaid transaction data into a format compatible with our database model
    """
    formatted_transactions = []
    
    for transaction in plaid_transactions:
        # Determine transaction type (credit or debit)
        transaction_type = 'credit' if transaction['amount'] < 0 else 'debit'
        
        # Determine transaction category
        category = 'Other'
        if transaction['category']:
            category = transaction['category'][0]
        
        # Determine payment method
        payment_method = 'Card'
        if 'payment_channel' in transaction:
            if transaction['payment_channel'] == 'online':
                payment_method = 'Online'
            elif transaction['payment_channel'] == 'in store':
                payment_method = 'Card'
            elif transaction['payment_channel'] == 'other':
                payment_method = 'Other'
        
        # Format transaction date as a proper datetime object
        transaction_date = datetime.strptime(transaction['date'], '%Y-%m-%d')
        
        formatted_transactions.append({
            'user_id': user_id,
            'date': transaction_date,
            'description': transaction['name'],
            'amount': abs(transaction['amount']),  # Store amount as positive
            'type': transaction_type,
            'category': category,
            'method': payment_method,
            'plaid_transaction_id': transaction['transaction_id'],
            'account_id': transaction['account_id'],
            'is_pending': transaction.get('pending', False),
            'location': transaction.get('location', {}).get('address', None)
        })
    
    return formatted_transactions

def get_spending_by_category(access_token, start_date, end_date):
    """
    Get spending by category for the date range
    """
    transaction_data = get_transactions(access_token, start_date, end_date)
    transactions = transaction_data['transactions']
    
    # Group transactions by category
    categories = {}
    for transaction in transactions:
        if transaction['amount'] > 0:  # Only count expenses (debits)
            category = 'Other'
            if transaction['category']:
                category = transaction['category'][0]
            
            if category in categories:
                categories[category] += transaction['amount']
            else:
                categories[category] = transaction['amount']
    
    # Format for frontend display
    result = []
    for category, amount in categories.items():
        result.append({
            'category': category,
            'amount': amount
        })
    
    return result

def get_recent_transactions(access_token, limit=5):
    """
    Get recent transactions (limited to 'limit' number)
    """
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    
    transaction_data = get_transactions(access_token, start_date, end_date)
    transactions = transaction_data['transactions']
    
    # Sort by date (newest first) and limit
    transactions.sort(key=lambda x: x['date'], reverse=True)
    recent_transactions = transactions[:limit]
    
    return recent_transactions
