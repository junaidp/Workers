import express from 'express';
import { prisma } from '../index.js';
import { sendEmail } from '../utils/notifications.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message
      }
    });

    // Send to admin email
    await sendEmail(
      'junaidp2@hotmail.com',
      `New Contact Message: ${subject}`,
      `
        <h3>New Contact Message</h3>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    );

    await sendEmail(
      email,
      'We received your message',
      `
        <h3>Thank you for contacting us!</h3>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
      `
    );

    res.status(201).json({ 
      message: 'Message sent successfully',
      id: contactMessage.id
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

router.post('/fake-lead-report', async (req, res) => {
  try {
    const { tradesmanId, jobId, reason } = req.body;

    if (!tradesmanId || !jobId || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const report = await prisma.fakeLeadReport.create({
      data: {
        tradesmanId,
        jobId,
        reason
      }
    });

    const admins = await prisma.admin.findMany({
      include: { user: true }
    });

    for (const admin of admins) {
      if (admin.user.email) {
        await sendEmail(
          admin.user.email,
          `Fake Lead Report - Job ${jobId}`,
          `
            <h3>Fake Lead Report</h3>
            <p><strong>Tradesman ID:</strong> ${tradesmanId}</p>
            <p><strong>Job ID:</strong> ${jobId}</p>
            <p><strong>Reason:</strong></p>
            <p>${reason}</p>
          `
        );
      }
    }

    res.status(201).json({ 
      message: 'Report submitted successfully',
      id: report.id
    });
  } catch (error) {
    console.error('Fake lead report error:', error);
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

export default router;
