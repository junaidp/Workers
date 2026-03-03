import express from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.get('/balance', authenticate, authorize('TRADESMAN'), async (req: AuthRequest, res) => {
  try {
    const tradesman = await prisma.tradesman.findUnique({
      where: { userId: req.user!.userId },
      select: { prepaidCredit: true }
    });

    if (!tradesman) {
      return res.status(404).json({ message: 'Tradesman profile not found' });
    }

    res.json({ balance: tradesman.prepaidCredit });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Failed to get balance' });
  }
});

router.get('/transactions', authenticate, authorize('TRADESMAN'), async (req: AuthRequest, res) => {
  try {
    const tradesman = await prisma.tradesman.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!tradesman) {
      return res.status(404).json({ message: 'Tradesman profile not found' });
    }

    const transactions = await prisma.creditTransaction.findMany({
      where: { tradesmanId: tradesman.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Failed to get transactions' });
  }
});

router.post('/topup', authenticate, authorize('TRADESMAN'), async (req: AuthRequest, res) => {
  try {
    const { amount, paymentMethod, transactionRef } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const tradesman = await prisma.tradesman.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!tradesman) {
      return res.status(404).json({ message: 'Tradesman profile not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.tradesman.update({
        where: { id: tradesman.id },
        data: {
          prepaidCredit: { increment: amount }
        }
      });

      await tx.creditTransaction.create({
        data: {
          tradesmanId: tradesman.id,
          amount,
          type: 'TOP_UP',
          description: `Credit top-up via ${paymentMethod}`,
          balanceBefore: tradesman.prepaidCredit,
          balanceAfter: tradesman.prepaidCredit + amount,
          paymentMethod,
          transactionRef
        }
      });
    });

    res.json({ 
      message: 'Credit topped up successfully',
      newBalance: tradesman.prepaidCredit + amount
    });
  } catch (error) {
    console.error('Top up error:', error);
    res.status(500).json({ message: 'Failed to top up credit' });
  }
});

router.post('/payfast/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    console.log('PayFast webhook received:', req.body);
    res.json({ message: 'Webhook received' });
  } catch (error) {
    console.error('PayFast webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

router.post('/jazzcash/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    console.log('JazzCash webhook received:', req.body);
    res.json({ message: 'Webhook received' });
  } catch (error) {
    console.error('JazzCash webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

export default router;
