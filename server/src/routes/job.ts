import express from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { generateJobId } from '../utils/idGenerator.js';
import { sendWhatsApp } from '../utils/notifications.js';
import { notifyTradesmenForJob } from '../services/jobMatcher.js';

const router = express.Router();

router.post('/', authenticate, authorize('CUSTOMER'), upload.array('images', 5), async (req: AuthRequest, res) => {
  try {
    const {
      serviceIds,
      description,
      city,
      area,
      preferredDate,
      preferredTime,
      isFlexible,
      isDirectRequest,
      targetTradesmanId
    } = req.body;

    const customer = await prisma.customer.findUnique({
      where: { userId: req.user!.userId },
      include: { user: true }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    const jobId = await generateJobId();
    const images = (req.files as Express.Multer.File[])?.map(file => `/uploads/${file.filename}`) || [];

    const job = await prisma.job.create({
      data: {
        jobId,
        customerId: customer.id,
        serviceType: Array.isArray(serviceIds) ? serviceIds.join(',') : serviceIds,
        description,
        location: `${area}, ${city}`,
        city,
        area,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime,
        isFlexible: isFlexible === 'true' || isFlexible === true,
        images,
        isDirectRequest: isDirectRequest === 'true' || isDirectRequest === true,
        targetTradesmanId: targetTradesmanId || null,
        services: {
          create: (Array.isArray(serviceIds) ? serviceIds : [serviceIds]).map((serviceId: string) => ({
            serviceId
          }))
        }
      },
      include: {
        services: {
          include: {
            service: true
          }
        }
      }
    });

    await sendWhatsApp(
      customer.user.whatsapp!,
      `Your job request (${jobId}) has been submitted successfully. You will be contacted by up to 3 tradesmen.`
    );

    await notifyTradesmenForJob(job.id);

    res.status(201).json({
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Post job error:', error);
    res.status(500).json({ message: 'Failed to post job' });
  }
});

router.get('/my-jobs', authenticate, authorize('CUSTOMER'), async (req: AuthRequest, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    const jobs = await prisma.job.findMany({
      where: { customerId: customer.id },
      include: {
        services: {
          include: {
            service: true
          }
        },
        responses: {
          include: {
            tradesman: {
              include: {
                user: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Failed to get jobs' });
  }
});

router.get('/:jobId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({
      where: { jobId },
      include: {
        customer: {
          include: {
            user: true
          }
        },
        services: {
          include: {
            service: {
              include: {
                category: true
              }
            }
          }
        },
        responses: {
          include: {
            tradesman: {
              include: {
                user: true,
                services: true
              }
            }
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user!.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({
        where: { userId: req.user!.userId }
      });
      if (job.customerId !== customer?.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Failed to get job' });
  }
});

router.post('/:jobId/accept', authenticate, authorize('TRADESMAN'), async (req: AuthRequest, res) => {
  try {
    const { jobId } = req.params;

    const tradesman = await prisma.tradesman.findUnique({
      where: { userId: req.user!.userId },
      include: { user: true }
    });

    if (!tradesman) {
      return res.status(404).json({ message: 'Tradesman profile not found' });
    }

    if (!tradesman.isApproved) {
      return res.status(403).json({ message: 'Your account is not approved yet' });
    }

    if (tradesman.prepaidCredit < 1) {
      return res.status(400).json({ message: 'Insufficient credit. Please top up.' });
    }

    const job = await prisma.job.findUnique({
      where: { jobId },
      include: {
        customer: {
          include: {
            user: true
          }
        },
        responses: true
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.acceptedCount >= job.maxAcceptances) {
      return res.status(400).json({ message: 'Job already has maximum acceptances' });
    }

    const existingResponse = await prisma.jobResponse.findUnique({
      where: {
        jobId_tradesmanId: {
          jobId: job.id,
          tradesmanId: tradesman.id
        }
      }
    });

    if (!existingResponse) {
      return res.status(404).json({ message: 'Job response not found' });
    }

    if (existingResponse.status !== 'PENDING') {
      return res.status(400).json({ message: 'Job already responded to' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.jobResponse.update({
        where: { id: existingResponse.id },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
          creditDeducted: true
        }
      });

      await tx.tradesman.update({
        where: { id: tradesman.id },
        data: {
          prepaidCredit: { decrement: 1 }
        }
      });

      await tx.creditTransaction.create({
        data: {
          tradesmanId: tradesman.id,
          amount: -1,
          type: 'JOB_ACCEPTANCE',
          description: `Job ${jobId} acceptance`,
          balanceBefore: tradesman.prepaidCredit,
          balanceAfter: tradesman.prepaidCredit - 1
        }
      });

      await tx.job.update({
        where: { id: job.id },
        data: {
          acceptedCount: { increment: 1 }
        }
      });
    });

    const customerContact = {
      email: job.customer.user.email!,
      whatsapp: job.customer.user.whatsapp!
    };

    const tradesmanContact = {
      mobile: tradesman.user.mobile,
      whatsapp: tradesman.user.whatsapp!
    };

    await sendWhatsApp(
      customerContact.whatsapp,
      `Tradesman ${tradesman.tradesmanId} has accepted your job (${jobId})!\n\nContact: ${tradesmanContact.mobile}\nWhatsApp: ${tradesmanContact.whatsapp}`
    );

    await sendWhatsApp(
      tradesmanContact.whatsapp,
      `You accepted job ${jobId}.\n\nCustomer: ${job.customer.fullName}\nMobile: ${job.customer.user.mobile}\nWhatsApp: ${customerContact.whatsapp}`
    );

    const otherResponses = job.responses.filter(r => r.tradesmanId !== tradesman.id && r.status === 'PENDING');
    for (const response of otherResponses) {
      const otherTradesman = await prisma.tradesman.findUnique({
        where: { id: response.tradesmanId },
        include: { user: true }
      });
      if (otherTradesman) {
        await sendWhatsApp(
          otherTradesman.user.whatsapp!,
          `Job ${jobId}: ${job.acceptedCount + 1} tradesman(s) have accepted. Act fast!`
        );
      }
    }

    res.json({ message: 'Job accepted successfully' });
  } catch (error) {
    console.error('Accept job error:', error);
    res.status(500).json({ message: 'Failed to accept job' });
  }
});

router.post('/:jobId/decline', authenticate, authorize('TRADESMAN'), async (req: AuthRequest, res) => {
  try {
    const { jobId } = req.params;

    const tradesman = await prisma.tradesman.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!tradesman) {
      return res.status(404).json({ message: 'Tradesman profile not found' });
    }

    const job = await prisma.job.findUnique({
      where: { jobId }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const response = await prisma.jobResponse.findUnique({
      where: {
        jobId_tradesmanId: {
          jobId: job.id,
          tradesmanId: tradesman.id
        }
      }
    });

    if (!response) {
      return res.status(404).json({ message: 'Job response not found' });
    }

    await prisma.jobResponse.update({
      where: { id: response.id },
      data: {
        status: 'DECLINED',
        respondedAt: new Date()
      }
    });

    await notifyTradesmenForJob(job.id);

    res.json({ message: 'Job declined successfully' });
  } catch (error) {
    console.error('Decline job error:', error);
    res.status(500).json({ message: 'Failed to decline job' });
  }
});

export default router;
