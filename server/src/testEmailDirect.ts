import nodemailer from 'nodemailer';

// Test with your actual email credentials
async function testEmailDirect() {
  console.log('🔧 Testing email with direct credentials...');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'gofatoorahhyphen11@gmail.com',
      pass: 'hpubgqhmjsxvtkas',
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    // Verify connection
    console.log('📡 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Test sending email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: 'noreply@workersmarketplace.com',
      to: 'gofatoorahhyphen11@gmail.com', // Send to self for testing
      subject: 'Test Email - Workers Marketplace',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from Workers Marketplace server.</p>
        <p>If you receive this, email configuration is working correctly!</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.error('Error details:', (error as Error).message);
    
    if ((error as any).code === 'EAUTH') {
      console.error('Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
    } else if ((error as any).code === 'ECONNECTION') {
      console.error('Connection failed - check EMAIL_HOST and EMAIL_PORT');
    } else if ((error as any).code === 'ETIMEDOUT') {
      console.error('Connection timed out - check network/firewall settings');
    }
  }
}

testEmailDirect();
