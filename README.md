# Boper - Job Management & Invoicing Platform

A comprehensive job management and invoicing platform for freelancers and small businesses, with Stripe payment integration.

## Features

- **Dashboard**: Overview of active jobs, pending invoices, and monthly revenue
- **Job Management**: Create, track, and manage jobs through their lifecycle
- **Client Management**: Organize client information and job history
- **Invoicing**: Generate professional invoices and track payment status
- **Calendar View**: Schedule and visualize jobs on an interactive calendar
- **Payment Processing**: Accept payments through Stripe integration
- **Reports**: Analyze business performance with visual reports

## Technical Stack

- **Frontend**: React with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Payments**: Stripe integration
- **UI Components**: Shadcn UI components
- **Invoice Generation**: jsPDF

## Deployment Guide

See the [deployment guide](DEPLOYMENT.md) for detailed instructions on deploying the application.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.template`)
4. Set up the database (see `database/README.md`)
5. Start the development server: `npm run dev`

## Environment Variables

Copy `.env.template` to `.env` and fill in your values:

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

## Database Setup

See the [database README](database/README.md) for detailed instructions on setting up and migrating the database.

## License

All rights reserved. This software and its source code are proprietary and confidential.