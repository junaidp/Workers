import express from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { generateTradesmanId } from '../utils/idGenerator.js';
import { sendEmail, sendWhatsApp } from '../utils/notifications.js';

const router = express.Router();

router.get('/dashboard/stats', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const [
      totalCustomers,
      totalTradesmen,
      pendingTradesmen,
      totalJobs,
      activeJobs,
      completedJobs
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.tradesman.count({ where: { isApproved: true } }),
      prisma.tradesman.count({ where: { isApproved: false, verificationStatus: 'PENDING' } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'PENDING' } }),
      prisma.job.count({ where: { status: 'COMPLETED' } })
    ]);

    res.json({
      totalCustomers,
      totalTradesmen,
      pendingTradesmen,
      totalJobs,
      activeJobs,
      completedJobs
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Failed to get stats' });
  }
});

router.get('/tradesmen/pending', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const tradesmen = await prisma.tradesman.findMany({
      where: {
        isApproved: false,
        verificationStatus: 'PENDING'
      },
      include: {
        user: true,
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
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tradesmen);
  } catch (error) {
    console.error('Get pending tradesmen error:', error);
    res.status(500).json({ message: 'Failed to get pending tradesmen' });
  }
});

router.post('/tradesman/:id/approve', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const tradesman = await prisma.tradesman.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!tradesman) {
      return res.status(404).json({ message: 'Tradesman not found' });
    }

    const tradesmanId = await generateTradesmanId();

    await prisma.tradesman.update({
      where: { id },
      data: {
        tradesmanId,
        isApproved: true,
        verificationStatus: 'VERIFIED'
      }
    });

    if (tradesman.user.email) {
      await sendEmail(
        tradesman.user.email,
        'Registration Approved',
        `Congratulations! Your registration has been approved. Your Tradesman ID is: ${tradesmanId}`
      );
    }

    await sendWhatsApp(
      tradesman.user.whatsapp!,
      `Congratulations! Your registration has been approved. Your Tradesman ID is: ${tradesmanId}. You have 2 free job leads to get started!`
    );

    res.json({ message: 'Tradesman approved successfully', tradesmanId });
  } catch (error) {
    console.error('Approve tradesman error:', error);
    res.status(500).json({ message: 'Failed to approve tradesman' });
  }
});

router.post('/tradesman/:id/reject', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const tradesman = await prisma.tradesman.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!tradesman) {
      return res.status(404).json({ message: 'Tradesman not found' });
    }

    await prisma.tradesman.update({
      where: { id },
      data: {
        verificationStatus: 'REJECTED'
      }
    });

    if (tradesman.user.email) {
      await sendEmail(
        tradesman.user.email,
        'Registration Rejected',
        `Unfortunately, your registration has been rejected. Reason: ${reason || 'Not specified'}`
      );
    }

    await sendWhatsApp(
      tradesman.user.whatsapp!,
      `Your registration has been rejected. ${reason ? `Reason: ${reason}` : ''}`
    );

    res.json({ message: 'Tradesman rejected successfully' });
  } catch (error) {
    console.error('Reject tradesman error:', error);
    res.status(500).json({ message: 'Failed to reject tradesman' });
  }
});

router.put('/tradesman/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { badge, isVisible, prepaidCredit } = req.body;

    const updateData: any = {};
    if (badge) updateData.badge = badge;
    if (isVisible !== undefined) updateData.isVisible = isVisible;
    if (prepaidCredit !== undefined) {
      const tradesman = await prisma.tradesman.findUnique({ where: { id } });
      if (tradesman) {
        updateData.prepaidCredit = parseInt(prepaidCredit);
        
        await prisma.creditTransaction.create({
          data: {
            tradesmanId: id,
            amount: parseInt(prepaidCredit) - tradesman.prepaidCredit,
            type: 'ADMIN_ADJUSTMENT',
            description: 'Admin credit adjustment',
            balanceBefore: tradesman.prepaidCredit,
            balanceAfter: parseInt(prepaidCredit)
          }
        });
      }
    }

    const tradesman = await prisma.tradesman.update({
      where: { id },
      data: updateData
    });

    res.json({ message: 'Tradesman updated successfully', tradesman });
  } catch (error) {
    console.error('Update tradesman error:', error);
    res.status(500).json({ message: 'Failed to update tradesman' });
  }
});

router.get('/users', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (role) {
      where.role = role;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          customer: true,
          tradesman: true,
          admin: true
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

router.put('/user/:id/status', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await prisma.user.update({
      where: { id },
      data: { isActive }
    });

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

router.get('/fake-lead-reports', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const reports = await prisma.fakeLeadReport.findMany({
      include: {
        tradesman: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reports);
  } catch (error) {
    console.error('Get fake lead reports error:', error);
    res.status(500).json({ message: 'Failed to get reports' });
  }
});

router.post('/fake-lead-report/:id/resolve', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { refund } = req.body;

    const report = await prisma.fakeLeadReport.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (refund) {
      const tradesman = await prisma.tradesman.findUnique({
        where: { id: report.tradesmanId }
      });

      if (tradesman) {
        await prisma.tradesman.update({
          where: { id: tradesman.id },
          data: {
            prepaidCredit: { increment: 1 }
          }
        });

        await prisma.creditTransaction.create({
          data: {
            tradesmanId: tradesman.id,
            amount: 1,
            type: 'FAKE_LEAD_REFUND',
            description: `Refund for fake lead report: ${report.jobId}`,
            balanceBefore: tradesman.prepaidCredit,
            balanceAfter: tradesman.prepaidCredit + 1
          }
        });
      }
    }

    await prisma.fakeLeadReport.update({
      where: { id },
      data: {
        isResolved: true,
        refunded: refund
      }
    });

    res.json({ message: 'Report resolved successfully' });
  } catch (error) {
    console.error('Resolve fake lead report error:', error);
    res.status(500).json({ message: 'Failed to resolve report' });
  }
});

router.get('/contact-messages', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
});

router.put('/contact-message/:id/resolve', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.contactMessage.update({
      where: { id },
      data: { isResolved: true }
    });

    res.json({ message: 'Message marked as resolved' });
  } catch (error) {
    console.error('Resolve contact message error:', error);
    res.status(500).json({ message: 'Failed to resolve message' });
  }
});

export default router;
