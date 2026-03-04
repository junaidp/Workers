import express from 'express';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { validateEmail, validatePakistanMobile } from '../utils/validation.js';
import { sendVerificationEmail, sendWhatsApp } from '../utils/notifications.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/register/customer', async (req, res) => {
  try {
    const { fullName, email, mobile, whatsapp, city, area } = req.body;

    if (!fullName || !mobile || !city || !area) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!validatePakistanMobile(mobile)) {
      return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { mobile },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this mobile or email' });
    }

    const user = await prisma.user.create({
      data: {
        mobile,
        email: email || null,
        whatsapp: whatsapp || mobile,
        role: 'CUSTOMER',
        countryCode: '+92',
        customer: {
          create: {
            fullName,
            city,
            area,
          }
        }
      },
      include: {
        customer: true
      }
    });

    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        type: email ? 'email' : 'whatsapp',
        expiresAt
      }
    });

    if (email) {
      await sendVerificationEmail(email, verificationToken, 'customer');
    }

    const whatsappVerificationLink = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}&type=whatsapp`;
    await sendWhatsApp(user.whatsapp!, `Welcome! Verify your account: ${whatsappVerificationLink}`);

    res.status(201).json({
      message: 'Registration successful. Please verify your account.',
      userId: user.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    if (verificationToken.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification token expired' });
    }

    const updateData: any = {};
    if (verificationToken.type === 'email') {
      updateData.isEmailVerified = true;
    } else if (verificationToken.type === 'whatsapp') {
      updateData.isWhatsappVerified = true;
    }

    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: updateData
    });

    await prisma.verificationToken.delete({
      where: { token }
    });

    const user = await prisma.user.findUnique({
      where: { id: verificationToken.userId },
      include: {
        customer: true,
        tradesman: true
      }
    });

    const jwtToken = jwt.sign(
      { userId: user!.id, role: user!.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      message: 'Verification successful',
      token: jwtToken,
      user: {
        id: user!.id,
        role: user!.role,
        email: user!.email,
        mobile: user!.mobile,
        customer: user!.customer,
        tradesman: user!.tradesman
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { mobile, email } = req.body;

    if (!mobile && !email) {
      return res.status(400).json({ message: 'Mobile or email required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(mobile ? [{ mobile }] : []),
          ...(email ? [{ email }] : [])
        ],
        isActive: true
      },
      include: {
        customer: true,
        tradesman: true,
        admin: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isEmailVerified && !user.isWhatsappVerified) {
      return res.status(401).json({ message: 'Please verify your account first' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        mobile: user.mobile,
        customer: user.customer,
        tradesman: user.tradesman,
        admin: user.admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const { mobile, email } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(mobile ? [{ mobile }] : []),
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified && user.isWhatsappVerified) {
      return res.status(400).json({ message: 'Account already verified' });
    }

    await prisma.verificationToken.deleteMany({
      where: { userId: user.id }
    });

    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        type: user.email ? 'email' : 'whatsapp',
        expiresAt
      }
    });

    if (user.email) {
      await sendVerificationEmail(user.email, verificationToken, 'resend');
    }

    if (user.whatsapp) {
      const whatsappVerificationLink = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}&type=whatsapp`;
      await sendWhatsApp(user.whatsapp, `Verification link: ${whatsappVerificationLink}`);
    }

    res.json({ message: 'Verification link sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Failed to resend verification' });
  }
});

export default router;
