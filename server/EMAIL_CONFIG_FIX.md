# Email Configuration Fix

## Problem Identified
Your Node.js app wasn't using the same SMTP settings as your working Java app.

## Java App Settings (Working)
```java
final String username="gofatoorahhyphen11@gmail.com";
final String password = "hpubgqhmjsxvtkas";
Properties prop = new Properties();
prop.put("mail.smtp.auth", "true");
prop.put("mail.smtp.starttls.enable", "true");
prop.put("mail.smtp.host", "smtp.gmail.com");
prop.put("mail.smtp.port", "587");
prop.put("mail.smtp.ssl.trust", "smtp.gmail.com");
```

## Node.js App Settings (Fixed)
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,           // smtp.gmail.com
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,                          // false for 587
  auth: {
    user: process.env.EMAIL_USER,        // gofatoorahhyphen11@gmail.com
    pass: process.env.EMAIL_PASSWORD,     // hpubgqhmjsxvtkas
  },
  tls: {
    rejectUnauthorized: false            // Equivalent to ssl.trust
  }
});
```

## Key Differences Fixed

### 1. TLS Configuration
**Before**: Missing TLS settings
**After**: Added `tls: { rejectUnauthorized: false }`

### 2. StartTLS
**Java**: `mail.smtp.starttls.enable = true`
**Node.js**: `secure: false` + TLS configuration (equivalent)

### 3. SSL Trust
**Java**: `mail.smtp.ssl.trust = "smtp.gmail.com"`
**Node.js**: `tls: { rejectUnauthorized: false }`

## Environment Variables Required

Make sure your `.env` file has:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=gofatoorahhyphen11@gmail.com
EMAIL_PASSWORD=hpubgqhmjsxvtkas
EMAIL_FROM=noreply@workersmarketplace.com
```

## Test Email Configuration

### Run the Test Script
```bash
npm run test:email
```

### Expected Output
```
🔧 Testing email configuration...
📡 Verifying SMTP connection...
✅ SMTP connection verified successfully
📧 Sending test email...
✅ Email sent successfully!
Message ID: <some-message-id>
Preview URL: https://ethereal.email/message/...
```

### If It Fails
```
❌ Email test failed: [error details]
Error details: [specific error]
```

## Common Issues and Solutions

### 1. "Authentication failed"
- Check EMAIL_USER and EMAIL_PASSWORD
- Make sure Gmail app password is used (not regular password)
- Enable 2-factor authentication and use app password

### 2. "Connection failed"
- Check EMAIL_HOST and EMAIL_PORT
- Verify network connectivity
- Check firewall settings

### 3. "Connection timed out"
- Check network connection
- Verify port 587 is not blocked
- Try different network

## Gmail App Password Setup

If you haven't set up app password:

1. Go to Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Generate new app password
4. Use the generated password in EMAIL_PASSWORD

## Next Steps

1. ✅ Update your environment variables with correct email settings
2. ✅ Run `npm run test:email` to verify configuration
3. ✅ Test tradesman registration again
4. ✅ Check if emails are now being delivered

## Files Changed

1. `src/utils/notifications.ts` - Updated SMTP configuration
2. `src/testEmail.ts` - Created email test script
3. `package.json` - Added test:email script
