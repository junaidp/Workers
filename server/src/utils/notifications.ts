import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'gofatoorahhyphen11@gmail.com',
    pass: 'hpubgqhmjsxvtkas'
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendEmail(to: string, subject: string, html: string) {
  const fromAddress = 'gofatoorahhyphen11@gmail.com';

  console.log('📧 Email Configuration:');
  console.log(`   - Provider: Gmail SMTP`);
  console.log(`   - From: ${fromAddress}`);
  console.log(`   - To: ${to}`);
  console.log(`   - Subject: ${subject}`);

  const textFallback = html.replace(/<[^>]+>/g, '').trim();

  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      text: textFallback || undefined
    });
    console.log('✅ Email sent');
  } catch (error) {
    console.error('❌ Email error:', error);
    throw error;
  }
}







export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Gmail SMTP email provider configured');
    return true;
  } catch (error) {
    console.error('❌ Gmail SMTP connection failed:', error);
    return false;
  }
}

export async function sendWhatsApp(phoneNumber: string, message: string) {
  try {
    console.log(`WhatsApp message to ${phoneNumber}: ${message}`);
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
  }
}

export async function sendVerificationEmail(email: string, token: string, type: string) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}&type=${type}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Email Verification</h2>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
        Verify Email
      </a>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `;
  
  await sendEmail(email, 'Verify Your Email', html);
}

export async function sendJobNotificationToTradesman(
  tradesmanContact: { email?: string; whatsapp: string },
  jobId: string,
  jobDescription: string,
  acceptUrl: string,
  declineUrl: string
) {
  const message = `New Job Alert! Job ID: ${jobId}\n\n${jobDescription}\n\nAccept: ${acceptUrl}\nDecline: ${declineUrl}`;
  
  await sendWhatsApp(tradesmanContact.whatsapp, message);
  
  if (tradesmanContact.email) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Job Opportunity</h2>
        <p><strong>Job ID:</strong> ${jobId}</p>
        <p><strong>Description:</strong></p>
        <p>${jobDescription}</p>
        <div style="margin: 24px 0;">
          <a href="${acceptUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 4px; margin-right: 8px;">
            Accept Job
          </a>
          <a href="${declineUrl}" style="display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 4px;">
            Decline Job
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Note: You need sufficient credit to accept this job.</p>
      </div>
    `;
    
    await sendEmail(tradesmanContact.email, `New Job Opportunity - ${jobId}`, html);
  }
}

export async function sendJobAcceptedNotification(
  customerContact: { email: string; whatsapp: string },
  tradesmanId: string,
  jobId: string,
  tradesmanContact: { mobile: string; whatsapp: string }
) {
  const message = `Tradesman ${tradesmanId} has accepted your job (${jobId})!\n\nContact: ${tradesmanContact.mobile}\nWhatsApp: ${tradesmanContact.whatsapp}`;
  
  await sendWhatsApp(customerContact.whatsapp, message);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Tradesman Interested in Your Job!</h2>
      <p>Good news! Tradesman <strong>${tradesmanId}</strong> is interested in performing your job (ID: ${jobId}).</p>
      <p><strong>Contact Details:</strong></p>
      <ul>
        <li>Mobile: ${tradesmanContact.mobile}</li>
        <li>WhatsApp: ${tradesmanContact.whatsapp}</li>
      </ul>
      <p>They will contact you soon to discuss the job details. You can also reach out to them directly.</p>
    </div>
  `;
  
  await sendEmail(customerContact.email, `Tradesman Interested - Job ${jobId}`, html);
}

export async function sendContactDetailsToTradesman(
  tradesmanContact: { email?: string; whatsapp: string },
  jobId: string,
  customerContact: { name: string; mobile: string; whatsapp: string }
) {
  const message = `Job ${jobId} - Customer Contact Details:\n\nName: ${customerContact.name}\nMobile: ${customerContact.mobile}\nWhatsApp: ${customerContact.whatsapp}`;
  
  await sendWhatsApp(tradesmanContact.whatsapp, message);
  
  if (tradesmanContact.email) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Customer Contact Details - Job ${jobId}</h2>
        <p><strong>Name:</strong> ${customerContact.name}</p>
        <p><strong>Mobile:</strong> ${customerContact.mobile}</p>
        <p><strong>WhatsApp:</strong> ${customerContact.whatsapp}</p>
        <p>Please contact the customer to discuss the job details and finalize the project.</p>
      </div>
    `;
    
    await sendEmail(tradesmanContact.email, `Customer Contact - Job ${jobId}`, html);
  }
}
