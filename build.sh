#!/bin/bash

# Build script for Boper production deployment

echo "Starting Boper production build..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build frontend and backend
echo "Building frontend and backend..."
npm run build

# Create necessary directories
echo "Creating deployment structure..."
mkdir -p dist/public

# Copy static assets
echo "Copying static assets..."
cp -r dist/* deployment/dist/

# Database setup
echo "Setting up database files..."
cp -r database deployment/

# Configuration files
echo "Copying configuration files..."
cp .env.template deployment/
cp ecosystem.config.js deployment/
cp DEPLOYMENT.md deployment/
cp README.md deployment/

echo "Build complete! The deployment package is ready in the 'deployment' directory."