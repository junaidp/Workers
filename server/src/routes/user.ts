import express from 'express';
import { prisma } from '../index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        customer: true,
        tradesman: {
          include: {
            services: {
              include: {
                service: {
                  include: {
                    category: true
                  }
                }
              }
            },
            portfolioImages: true,
            certifications: true
          }
        },
        admin: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user data' });
  }
});

router.put('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, whatsapp, landline, city, area } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        firstName,
        lastName,
        whatsapp
      }
    });

    if (req.user!.role === 'CUSTOMER') {
      await prisma.customer.update({
        where: { userId: req.user!.userId },
        data: {
          landline,
          city,
          area
        }
      });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

export default router;
