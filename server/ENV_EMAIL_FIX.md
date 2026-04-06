# Fix Email Environment Variables

## Problem
Your `.env` file has placeholder values instead of your actual email credentials.

## Current .env (Incorrect)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@workersmarketplace.com
```

## Required .env (Correct)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=gofatoorahhyphen11@gmail.com
EMAIL_PASSWORD=hpubgqhmjsxvtkas
EMAIL_FROM=noreply@workersmarketplace.com
```

## Quick Fix Options

### Option 1: Test Directly First
```bash
npm run test:email:direct
```
This tests with your actual credentials without changing .env

### Option 2: Update .env File
Edit your `.env` file and replace these lines:
```env
EMAIL_USER=your-email@gmail.com        → EMAIL_USER=gofatoorahhyphen11@gmail.com
EMAIL_PASSWORD=your-email-password     → EMAIL_PASSWORD=hpubgqhmjsxvtkas
```

### Option 3: Use Environment Variables
```bash
export EMAIL_USER=gofatoorahhyphen11@gmail.com
export EMAIL_PASSWORD=hpubgqhmjsxvtkas
npm run test:email
```

## Test Commands

### Test with Direct Credentials
```bash
npm run test:email:direct
```

### Test with Environment Variables (After updating .env)
```bash
npm run test:email
```

## Expected Success Output
```
🔧 Testing email with direct credentials...
📡 Verifying SMTP connection...
✅ SMTP connection verified successfully
📧 Sending test email...
✅ Email sent successfully!
Message ID: <some-message-id>
```

## For Production (Render)

Make sure to update these environment variables in your Render dashboard:
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_USER=gofatoorahhyphen11@gmail.com`
- `EMAIL_PASSWORD=hpubgqhmjsxvtkas`
- `EMAIL_FROM=noreply@workersmarketplace.com`

## Security Note
⚠️ **Important**: Never commit actual passwords to git. The .env file should remain in .gitignore.

## Next Steps
1. Run `npm run test:email:direct` to verify credentials work
2. Update your .env file with correct values
3. Test again with `npm run test:email`
4. Update Render environment variables for production
