#!/bin/bash
# setup_mysql.sh - Script to set up MySQL/MariaDB database for IFi Finance App

# Load environment variables if .env file exists
if [ -f .env ]; then
    source .env
fi

# Default values if not set in environment
DB_USER=${DB_USER:-ifi_user}
DB_PASSWORD=${DB_PASSWORD:-ifi_password}
DB_NAME=${DB_NAME:-ifi_finance}
DB_HOST=${DB_HOST:-localhost}

echo "Setting up MySQL database for IFi Finance App..."
echo "Database: $DB_NAME"
echo "User: $DB_USER"

# MySQL commands to create database and user
SQL_COMMANDS=$(cat << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'$DB_HOST';
FLUSH PRIVILEGES;
EOF
)

# Execute the SQL commands
echo "$SQL_COMMANDS" | sudo mysql -u root -p

if [ $? -eq 0 ]; then
    echo "Database setup completed successfully!"
    echo "You can now run the Flask application to initialize the tables."
else
    echo "Error setting up the database. Please check your MySQL installation and credentials."
    exit 1
fi
