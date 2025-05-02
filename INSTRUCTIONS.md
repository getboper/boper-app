# Boper Deployment Package Instructions

This is the production-ready deployment package for Boper, your job management and invoicing platform.

## Package Contents

- `dist/` - The compiled frontend and backend code
- `database/` - Database setup and migration tools
- `.env.template` - Template for environment variables
- `ecosystem.config.js` - PM2 configuration for production
- `package.json` - Production dependencies
- `DEPLOYMENT.md` - Detailed deployment guide
- `README.md` - Application overview

## Quick Start

1. **Upload the entire package** to your Hostinger hosting environment
2. **Set up the database**:
   ```
   cd database
   npm install
   npm run migrate
   ```
3. **Configure environment variables**:
   - Copy `.env.template` to `.env`
   - Update with your database credentials and Stripe API keys

4. **Install dependencies**:
   ```
   npm install --production
   ```

5. **Start the application**:
   - With PM2 (recommended):
     ```
     npm install -g pm2
     pm2 start ecosystem.config.js
     pm2 startup
     pm2 save
     ```
   - Or using Hostinger's Node.js Manager through the control panel

## Further Instructions

For complete, detailed deployment instructions, please refer to the `DEPLOYMENT.md` file included in this package.

## Support

If you encounter any issues during deployment, please refer to the troubleshooting section in `DEPLOYMENT.md` or contact support for assistance.