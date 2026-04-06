# IPv6 Email Connection Fix

## Problem Identified
The email sending was failing with IPv6 connection error:
```
❌ Failed to send email to junaidp@gmail.com: Error: connect ENETUNREACH 2607:f8b0:400e:c00::6c:587 - Local (:::0)
```

This happens because Render's network prefers IPv6 but Gmail's IPv6 connectivity can be unreliable.

## Fixes Applied

### 1. Force IPv4 Connection
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  },
  // Force IPv4 to avoid IPv6 connection issues
  family: 4
});
```

### 2. Added Detailed Email Configuration Logging
```javascript
console.log(`📧 Email Configuration:`);
console.log(`   - Host: ${process.env.EMAIL_HOST}`);
console.log(`   - Port: ${process.env.EMAIL_PORT}`);
console.log(`   - From: ${process.env.EMAIL_FROM}`);
console.log(`   - User: ${process.env.EMAIL_USER}`);
console.log(`   - To: ${to}`);
console.log(`   - Subject: ${subject}`);
console.log(`   - Password: ${process.env.EMAIL_PASSWORD ? '[SET]' : '[NOT SET]'}`);
```

## Expected Behavior Now

### Before Fix
```
❌ Failed to send email: Error: connect ENETUNREACH 2607:f8b0:400e:c00::6c:587
```

### After Fix
```
📧 Email Configuration:
   - Host: smtp.gmail.com
   - Port: 587
   - From: noreply@workersmarketplace.com
   - User: gofatoorahhyphen11@gmail.com
   - To: junaidp@gmail.com
   - Subject: Verify Your Email
   - Password: [SET]
📧 Sending email to junaidp@gmail.com...
✅ Email sent successfully to junaidp@gmail.com
Message ID: <message-id>
```

## Why This Fix Works

### IPv6 vs IPv4 Issue
- **Render's Network**: Prefers IPv6 addresses
- **Gmail's IPv6**: Can be unreliable or blocked
- **Solution**: Force IPv4 connection with `family: 4`

### Network Connectivity
- IPv4 addresses are more reliable for SMTP connections
- Gmail's IPv4 SMTP servers are consistently accessible
- Avoids IPv6 routing issues on Render's infrastructure

## Testing the Fix

### Deploy and Test
1. Deploy the updated code to Render
2. Try tradesman registration with email
3. Check logs for detailed configuration output
4. Verify email is received successfully

### Expected Logs
You should now see:
1. ✅ Detailed email configuration logging
2. ✅ IPv4 connection to Gmail
3. ✅ Successful email delivery
4. ✅ User receives verification email

## Files Changed

1. `src/utils/notifications.ts`:
   - Added `family: 4` to force IPv4
   - Added detailed configuration logging
   - Enhanced error reporting

## Next Steps

1. **Deploy the fix** to Render
2. **Test registration** with a real email
3. **Check logs** for the detailed configuration output
4. **Verify email delivery** to user inbox

This should resolve the IPv6 connection issue and ensure reliable email delivery!
