# Boper Deployment Guide for Hostinger

This guide provides step-by-step instructions for deploying the Boper application on Hostinger.

## Prerequisites

Before starting the deployment process, ensure you have:

- A Hostinger hosting plan with Node.js support (Node.js v16+)
- A PostgreSQL database (can be on Hostinger or external)
- SSH access to your Hostinger account (recommended)
- Your Stripe API keys (for payment processing)

## Deployment Steps

### 1. Database Setup

1. Create a new PostgreSQL database through Hostinger's control panel or use an existing one
2. Note your database credentials (host, database name, username, password, port)
3. Run the database migration scripts:
   ```bash
   cd database
   npm install
   npm run migrate
   ```

### 2. Environment Configuration

1. Create a `.env` file based on the provided `.env.template`:
   ```
   # Database Configuration
   DATABASE_URL=postgres://yourusername:yourpassword@yourhost:5432/yourdatabase
   PGHOST=yourhost
   PGUSER=yourusername
   PGPASSWORD=yourpassword
   PGDATABASE=yourdatabase
   PGPORT=5432

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key

   # Server Configuration
   PORT=8080
   NODE_ENV=production
   ```

2. Update with your actual database credentials and Stripe API keys

### 3. Application Deployment

#### Via FTP:
1. Upload the entire package to your Hostinger hosting
2. Ensure the directory structure is preserved

#### Via SSH:
1. Connect to your Hostinger account via SSH
2. Navigate to your web directory
3. Upload or git clone the package
4. Run the following commands:
   ```bash
   npm install --production
   ```

### 4. Starting the Application

#### Using PM2 (Recommended):
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

#### Using Hostinger Node.js Manager:
1. In Hostinger control panel, navigate to Node.js applications
2. Create a new application pointing to your upload directory
3. Set the entry point to `dist/server/index.js`
4. Set Node.js version to 16 or higher

### 5. Domain and SSL Configuration

1. In Hostinger control panel, configure your domain settings
2. Enable SSL certificates for secure HTTPS access
3. Set up any necessary redirects

## Troubleshooting

### Common Issues

#### Database Connection Problems
- Verify that your database credentials are correct
- Check if the database server is accessible from your hosting
- Ensure the database user has appropriate permissions

#### Application Not Starting
- Check the application logs for error messages
- Verify that all dependencies are correctly installed
- Ensure your Node.js version is compatible (v16+)

#### Payment Processing Issues
- Verify your Stripe API keys are correct
- Test with Stripe's testing tools
- Check the server logs for API responses

## Maintenance

### Updating the Application
1. Create a backup of your application and database
2. Upload the new version to your server
3. Run any new database migrations
4. Restart the application

### Monitoring
1. Use PM2's monitoring tools to keep track of application performance
2. Set up regular database backups
3. Monitor Stripe dashboard for payment activities

## Security Considerations

- Keep your environment variables secure
- Regularly update dependencies for security patches
- Set up proper file permissions
- Enable HTTPS for all traffic

## Support

If you encounter any issues during deployment that aren't covered in this guide, please contact support for assistance.