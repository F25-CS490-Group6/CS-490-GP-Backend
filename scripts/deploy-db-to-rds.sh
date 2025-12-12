#!/bin/bash

# Deploy database to RDS
# This script should be run from EC2 instance

set -e

echo "🔄 Deploying database to RDS..."

# RDS Configuration
RDS_ENDPOINT="stygo-db.cpwmo26siew5.us-east-2.rds.amazonaws.com"
RDS_USER="admin"
RDS_DATABASE="salon_platform"
SQL_FILE="database/team_share_2025-12-12.sql"

echo "📦 Checking if SQL file exists..."
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ SQL file not found: $SQL_FILE"
    exit 1
fi

echo "✅ SQL file found!"
echo ""
echo "⚠️  WARNING: This will REPLACE the RDS database with the local dump!"
echo "📊 Target: $RDS_ENDPOINT"
echo "🗄️  Database: $RDS_DATABASE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "🔐 Please enter RDS password when prompted..."
echo ""

# Import the SQL file
mysql -h "$RDS_ENDPOINT" -u "$RDS_USER" -p "$RDS_DATABASE" < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database deployed successfully to RDS!"
    echo ""
    echo "🔍 Verifying tables..."
    mysql -h "$RDS_ENDPOINT" -u "$RDS_USER" -p -e "USE $RDS_DATABASE; SHOW TABLES;" | head -20
else
    echo ""
    echo "❌ Database deployment failed!"
    exit 1
fi

