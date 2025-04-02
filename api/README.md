NOTES FOR RAMI :
<pre><b>Core Authentication and User Management</b>


POST /api/register - Register a new user
POST /api/login - Authenticate and receive a JWT token
POST /api/reset-password - Request a password reset
POST /api/new-password - Set a new password with a reset token
GET /api/profile - Retrieve user profile information
PUT /api/profile - Update user profile information

Transaction Management

GET /api/transactions - Get all transactions
POST /api/transactions - Add a new transaction

Subscription Management

GET /api/subscriptions - Get all subscriptions
POST /api/subscriptions - Add a new subscription

Budget and Goal Management

GET /api/budget - Get all budget categories
PUT /api/budget - Update a budget category
GET /api/goals - Get all savings goals
PUT /api/goals - Update a savings goal </b> </pre>

__ TO BE COMPLETED __
Plaid Integration

GET /api/plaid/create_link_token - Create a Plaid Link token
POST /api/plaid/exchange_public_token - Exchange token and connect bank
GET /api/plaid/accounts - Get all connected bank accounts
DELETE /api/plaid/accounts/ - Unlink a bank account
POST /api/plaid/transactions/refresh - Refresh transactions from Plaid

Account and Financial Overview

GET /api/account-overview - Get account summary (balances, income, expenses)

User Preferences

GET /api/app-preferences - Get app preferences (currency, theme, language)
PUT /api/app-preferences - Update app preferences
GET /api/notifications - Get notification preferences
PUT /api/notifications - Update notification preferences

Financial Insights

GET /api/insights/spending-trends - Get spending trends over time
GET /api/insights/income-analysis - Get income analysis
GET /api/insights/expense-analysis - Get expense analysis
GET /api/insights/budget-analysis - Get budget analysis
GET /api/insights/personalized - Get personalized financial insights
GET /api/insights/financial-health - Get financial health score

Financial Advisor (LLM-based)

POST /api/advisor - Get comprehensive financial advice
GET /api/advisor/history - Get chat history with advisor
POST /api/advisor/chat - Chat with financial advisor

Educational Content

GET /api/education - Get list of educational content
GET /api/education/ - Get specific educational content
GET /api/education/categories - Get educational content categories

Static Content

GET /api/faq - Get FAQ content
GET /api/terms - Get terms of service content
GET /api/contact - Get contact information
POST /api/contact - Submit a contact form

# IFi Financial Literacy App - MySQL Backend API

This is the Flask backend API for the IFi Financial Literacy App, providing endpoints for user management, transactions, budgeting, savings goals, and bank account integration via Plaid. This implementation uses MySQL/MariaDB for the database.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- MySQL or MariaDB database server
- Plaid Developer Account (for the Plaid API)

### Database Setup

1. Install MySQL/MariaDB if you haven't already
```bash
# On Ubuntu
sudo apt-get update
sudo apt-get install mysql-server (for GCP PLEASE USE --- sudo apt-get install mariadb-server)

```

~ ~2. Run the database setup script to create the database and user
```bash
# Make the script executable
chmod +x setup_mysql.sh

# Run the script
./setup_mysql.sh
```~ ~

NOT NECESSARY
Alternatively, you can manually create the database and user:
```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE ifi_finance;
CREATE USER 'ifi_user'@'localhost' IDENTIFIED BY 'ifi_password';
GRANT ALL PRIVILEGES ON ifi_finance.* TO 'ifi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Plaid Setup

1. Create a Plaid developer account at [https://dashboard.plaid.com/signup](https://dashboard.plaid.com/signup)
2. Create a new Plaid application in the dashboard
3. Get your client ID and secret keys

### Installation

1. Clone this repository
```bash
git clone <repository-url>
cd cloned dir 
```

2. Create a virtual environment (recommended)
```bash
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Create a .env file with your configuration
```bash
cp .env.template .env
```

5. Edit the .env file with your Plaid API keys and database credentials
```
# Database Configuration
DB_USER=ifi_user
DB_PASSWORD=ifi_password
DB_HOST=localhost
DB_NAME=ifi_finance

# JWT Secret
SECRET_KEY=your_secret_key_here

# Plaid API Credentials
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_sandbox_secret
PLAID_ENV=sandbox
```

6. Run the application
```bash
python app.py
```

The API will be available at http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/register` - Register a new user
- POST `/api/login` - Login and receive a JWT token
- POST `/api/reset-password` - Request a password reset
- POST `/api/new-password` - Set a new password with a reset token

### Transactions
- GET `/api/transactions` - Get all transactions for the authenticated user
- POST `/api/transactions` - Add a new transaction

### Subscriptions
- GET `/api/subscriptions` - Get all subscriptions for the authenticated user
- POST `/api/subscriptions` - Add a new subscription

### Budget
- GET `/api/budget` - Get all budget categories for the authenticated user
- PUT `/api/budget` - Update a budget category

### Savings Goals
- GET `/api/goals` - Get all savings goals for the authenticated user
- PUT `/api/goals` - Update a savings goal

### User Profile
- GET `/api/profile` - Get the authenticated user's profile
- PUT `/api/profile` - Update the authenticated user's profile

### Plaid Integration
- GET `/api/plaid/create_link_token` - Create a Plaid Link token for connecting bank accounts
- POST `/api/plaid/exchange_public_token` - Exchange a public token for an access token and save bank account
- GET `/api/plaid/accounts` - Get all connected bank accounts for the user
- POST `/api/plaid/transactions/refresh` - Refresh transactions for all connected accounts
- GET `/api/plaid/spending_by_category` - Get spending data grouped by category

## Authentication

All API endpoints except for registration, login, and password reset require a valid JWT token. The token should be included in the Authorization header of requests as follows:

```
Authorization: Bearer <token>
```

## Integration with Frontend

To connect this backend with the React frontend:

1. Ensure the backend is running on port 5000
2. Configure the frontend to send API requests to `http://localhost:5000/api/...`
3. Store and include the JWT token in requests as needed
4. Install the necessary npm packages for Plaid integration:
   ```bash
   npm install react-plaid-link axios
   ```
5. Use the provided React components for Plaid integration

## Troubleshooting

### Database Connection Issues
- Verify your MySQL/MariaDB server is running
- Check the database credentials in your .env file
- Ensure the database and user exist with proper permissions

### Plaid Integration Issues
- Verify your Plaid API keys are correct in your .env file
- Ensure you're using the correct Plaid environment (sandbox, development, production)
- Check that your Plaid application is properly configured

## Security Considerations

This application uses JWT for authentication, but for a production environment you should consider:

1. Using HTTPS for all communications
2. Implementing IP-based rate limiting
3. Adding additional security headers
4. Setting up proper database backups
5. Securing your MySQL/MariaDB installation

API Examples :
# IFi Financial Literacy App API Documentation

This document provides sample API calls and JSON payloads for each endpoint of the IFi Financial Literacy application.

## Base URL

http://localhost:5000/api

## Authentication Endpoints

### Register a New User

**Endpoint:** `POST /register`

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "dob": "1990-01-15",
  "phone": "123-456-7890",
  "country": "USA"
}
Response (201 Created):

{
  "message": "Registration successful!"
}
Login
Endpoint: POST /login

Request Body:

{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
Response (200 OK):

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  }
}
Request Password Reset
Endpoint: POST /reset-password

Request Body:

{
  "email": "john.doe@example.com"
}
Response (200 OK):

{
  "message": "Password reset link sent",
  "resetLink": "http://localhost:3000/reset-password/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Set New Password
Endpoint: POST /new-password

Request Body:

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password": "newSecurePassword456"
}
Response (200 OK):

{
  "message": "Password has been reset!"
}
Transaction Endpoints
Note: All of the following endpoints require an Authorization header:


Authorization: Bearer <token>
Get All Transactions
Endpoint: GET /transactions

Response (200 OK):

[
  {
    "id": 1,
    "date": "2024-01-15",
    "description": "Grocery Store",
    "amount": 56.78,
    "type": "debit",
    "category": "Food",
    "method": "Card"
  },
  {
    "id": 2,
    "date": "2024-01-14",
    "description": "Salary Deposit",
    "amount": 2500.00,
    "type": "credit",
    "category": "Income",
    "method": "ACH"
  }
]
Add a Transaction
Endpoint: POST /transactions

Request Body:

{
  "date": "2024-03-20",
  "description": "Restaurant Dinner",
  "amount": 85.50,
  "type": "debit",
  "category": "Food",
  "method": "Card"
}
Response (201 Created):

{
  "message": "Transaction added!",
  "id": 6
}
Subscription Endpoints
Get All Subscriptions
Endpoint: GET /subscriptions

Response (200 OK):


[
  {
    "id": 1,
    "name": "Netflix",
    "amount": 15.99,
    "billingCycle": "Monthly",
    "nextBilling": "2024-04-15",
    "category": "Entertainment"
  },
  {
    "id": 2,
    "name": "Spotify Family",
    "amount": 14.99,
    "billingCycle": "Monthly",
    "nextBilling": "2024-04-18",
    "category": "Entertainment"
  }
]
Add a Subscription
Endpoint: POST /subscriptions

Request Body:


{
  "name": "Disney+",
  "amount": 7.99,
  "billingCycle": "Monthly",
  "nextBilling": "2024-04-20",
  "category": "Entertainment"
}
Response (201 Created):


{
  "message": "Subscription added!",
  "id": 6
}
Budget Endpoints
Get Budget Categories
Endpoint: GET /budget

Response (200 OK):


[
  {
    "id": 1,
    "category": "Food",
    "budget": 600.00,
    "spent": 450.00,
    "color": "#FF6384"
  },
  {
    "id": 2,
    "category": "Utilities",
    "budget": 400.00,
    "spent": 300.00,
    "color": "#36A2EB"
  }
]
Update Budget Category
Endpoint: PUT /budget

Request Body:


{
  "id": 1,
  "budget": 650.00,
  "spent": 450.00
}
Response (200 OK):


{
  "message": "Budget updated!"
}
Savings Goals Endpoints
Get Savings Goals
Endpoint: GET /goals

Response (200 OK):


[
  {
    "id": 1,
    "category": "Emergency Fund",
    "target": 5000.00,
    "saved": 2500.00,
    "color": "#FF6384"
  },
  {
    "id": 2,
    "category": "Vacation",
    "target": 1500.00,
    "saved": 800.00,
    "color": "#36A2EB"
  }
]
Update Savings Goal
Endpoint: PUT /goals

Request Body:


{
  "id": 1,
  "target": 5000.00,
  "saved": 2700.00
}
Response (200 OK):


{
  "message": "Goal updated!"
}
User Profile Endpoints
Get User Profile
Endpoint: GET /profile

Response (200 OK):


{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "dob": "1990-01-15",
  "phone": "123-456-7890",
  "country": "USA"
}
Update User Profile
Endpoint: PUT /profile

Request Body:


{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "987-654-3210",
  "country": "Canada"
}
Response (200 OK):

{
  "message": "Profile updated!"
}
Plaid Integration Endpoints
Create Link Token
Endpoint: GET /plaid/create_link_token

Response (200 OK):


{
  "link_token": "link-sandbox-123xyz...",
  "expiration": "2024-04-01T12:00:00Z",
  "request_id": "request-id-123"
}
Exchange Public Token
Endpoint: POST /plaid/exchange_public_token

Request Body:


{
  "public_token": "public-sandbox-123xyz...",
  "institution_id": "ins_123",
  "institution_name": "Chase"
}
Response (200 OK):


{
  "message": "Bank account linked successfully!",
  "item_id": 1
}
Get Accounts
Endpoint: GET /plaid/accounts

Response (200 OK):


[
  {
    "id": 1,
    "name": "Checking Account",
    "mask": "1234",
    "type": "depository",
    "subtype": "checking",
    "current_balance": 1250.45,
    "available_balance": 1200.00,
    "institution_name": "Chase"
  },
  {
    "id": 2,
    "name": "Savings Account",
    "mask": "5678",
    "type": "depository",
    "subtype": "savings",
    "current_balance": 5500.00,
    "available_balance": 5500.00,
    "institution_name": "Chase"
  }
]
Refresh Transactions
Endpoint: POST /plaid/transactions/refresh

Response (200 OK):


{
  "message": "Transactions refreshed successfully!"
}
Get Spending by Category
Endpoint: GET /plaid/spending_by_category?start_date=2024-01-01&end_date=2024-03-31

Response (200 OK):


[
  {
    "category": "Food and Drink",
    "amount": 850.75
  },
  {
    "category": "Travel",
    "amount": 1200.50
  },
  {
    "category": "Shopping",
    "amount": 560.25
  }
]

Testing with cURL
Login and Store Token

curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"securePassword123"}' \
  | jq '.token' -r > token.txt
Get Transactions with Stored Token

curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $(cat token.txt)"

Add a New Transaction

curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat token.txt)" \
  -d '{"date":"2024-03-20","description":"Restaurant Dinner","amount":85.50,"type":"debit","category":"Food","method":"Card"}'
Testing with Postman
Create a new collection for IFi APIs.

Add a POST request for login.

Add a test script to store the token:


if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.globals.set("auth_token", jsonData.token);
}
For subsequent requests, add the following header:


Authorization: Bearer {{auth_token}}
