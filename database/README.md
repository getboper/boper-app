# Boper Database Migration Tools

This directory contains the tools necessary to set up and maintain the Boper application database.

## Setup Instructions

1. First, ensure you have Node.js installed on your system.

2. Install dependencies:
   ```
   cd database
   npm install
   ```

3. Create a `.env` file in the root directory with your database connection details:
   ```
   DATABASE_URL=postgres://yourusername:yourpassword@yourhost:5432/yourdatabase
   PGHOST=yourhost
   PGUSER=yourusername
   PGPASSWORD=yourpassword
   PGDATABASE=yourdatabase
   PGPORT=5432
   ```

4. Run the migration script:
   ```
   npm run migrate
   ```

## Migration Files

The `migrations` directory contains SQL files that define the database schema. The migration tool will run these files in sequence based on their numeric prefix.

## Troubleshooting

If you encounter issues during migration:

1. Ensure your database credentials are correct
2. Check if the database server is accessible from your environment
3. Verify that the database user has sufficient privileges to create tables and types
4. Look for detailed error messages in the console output

For additional assistance, please refer to the main documentation or contact support.