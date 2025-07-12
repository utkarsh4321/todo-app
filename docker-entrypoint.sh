#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Optional: Wait for the database to be available (highly recommended)
# This requires `netcat` (nc) to be installed in your base image (e.g., `apk add netcat-openbsd` for Alpine)
# Replace 'db_host' and '5432' with your database service name/IP and port
# echo "Waiting for database connection..."
# while ! nc -z db_host 5432; do
#   sleep 1
# done
# echo "Database is up and running!"

# Run database migrations
echo "Running database migrations..."
# Replace with your actual migration command
npm run generate
npm run migrate
# npx sequelize-cli db:migrate
# npm run typeorm migration:run

echo "Migrations completed."

# Start the Node.js application
# "$@" expands to whatever is passed in the CMD instruction of the Dockerfile
echo "Starting Node.js application..."
exec "$@" # 'exec' replaces the shell process with your app process