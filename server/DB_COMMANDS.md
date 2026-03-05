# Database Commands Quick Reference

## 🗄️ Database Operations

### Clean Database (⚠️ DELETES ALL DATA)
```bash
npm run db:reset
```

### Seed Database (Adds initial data)
```bash
npm run db:seed
```

### Clean & Seed (⚠️ DELETES ALL DATA, then adds initial data)
```bash
npm run db:clean-seed
```

## 📋 What Gets Seeded

- ✅ Admin user: `admin@workersmarketplace.com`
- ✅ 4 main service categories
- ✅ 50+ individual services
- ✅ Proper relationships and hierarchies

## 🚀 Quick Start

For fresh development environment:
```bash
npm run db:clean-seed
npm run dev
```

## ⚠️ Warnings

- `db:reset` and `db:clean-seed` will DELETE ALL data
- Always backup production data before running reset commands
- Test in development before running in production

## 📚 Full Documentation

See `DATABASE_OPERATIONS.md` for detailed instructions.
