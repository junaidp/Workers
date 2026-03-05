# Database Operations Guide

## Available Scripts

### Clean Database
```bash
npm run db:reset
```
- Deletes all data from the database
- Resets all migrations
- **⚠️ WARNING**: This will delete ALL data permanently

### Seed Database
```bash
npm run db:seed
```
- Runs the seed script to populate the database with initial data
- Creates admin user and service categories
- Safe to run multiple times (checks for existing data)

### Clean and Seed Database
```bash
npm run db:clean-seed
```
- Combines reset and seed operations
- Cleans the database completely and then seeds it with initial data
- **⚠️ WARNING**: This will delete ALL data and recreate it

## What Gets Seeded

### 1. Admin User
- Email: `admin@workersmarketplace.com`
- Mobile: `3001234567`
- Role: `ADMIN`
- Password: (Will be set on first login)

### 2. Service Categories
The seed script creates the following service categories with their services:

#### Solar Installation Services
- Residential Solar Panel Installation
- Commercial Solar Installation
- Solar Panel Maintenance
- Solar Panel Repair
- Solar Battery Installation

#### Home Services
- Electrician Services (30+ sub-services)
- Plumbing Services (15+ sub-services)
- Geyser Services
- Handyman Services
- Painter Services
- Carpenter Services
- Home Inspection Services
- Pest Control Services

#### Cleaning Services
- Car Detailing Services
- Carpet Cleaning Services
- Water Tank Cleaning Services
- Chair Cleaning Services
- Curtain Cleaning Services
- Deep Cleaning Services (Commercial)
- Deep Cleaning Services (Residential)
- Mattress Cleaning Services
- Sofa Cleaning Services
- Solar Panel Cleaning Services

#### Personal Care (Female Only)
- Facial Services
- Hair Styling & Hair Cut
- Makeup Services
- Hair Treatment
- Mani Pedi
- Mehndi Services
- Waxing Services

## Usage Examples

### Development Setup
```bash
# Clean and seed database for fresh development
npm run db:clean-seed

# Start development server
npm run dev
```

### Production Reset
```bash
# ⚠️ ONLY if you need to completely reset production
npm run db:clean-seed
```

### Just Add New Data
```bash
# If you just want to add seed data without cleaning
npm run db:seed
```

## Database Schema

The seed script populates:
- `User` table (admin user)
- `Admin` table (admin profile)
- `ServiceCategory` table (main categories)
- `Service` table (individual services)

## Important Notes

1. **Backup First**: Always backup your database before running `db:reset`
2. **Environment**: Make sure your `.env` file has the correct `DATABASE_URL`
3. **Migrations**: The reset command will also reset migrations
4. **Idempotent**: The seed script checks for existing data and won't create duplicates

## Troubleshooting

### Connection Issues
```bash
# Check database connection
npx prisma db pull
```

### Migration Issues
```bash
# Reset migrations
npx prisma migrate reset --force
```

### Seed Issues
```bash
# Run seed with verbose output
DEBUG=* npm run db:seed
```

## Environment Variables Required

Make sure your `.env` file contains:
```env
DATABASE_URL="your_database_connection_string"
```

## Safety Precautions

1. **Never run `db:reset` in production without backup**
2. **Test seed scripts in development first**
3. **Keep backups of important data**
4. **Use version control for schema changes**
