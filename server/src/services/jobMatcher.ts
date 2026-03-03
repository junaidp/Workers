import { prisma } from '../index.js';
import { sendJobNotificationToTradesman, sendWhatsApp } from '../utils/notifications.js';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function findMatchingTradesmen(jobId: string, excludeTradesmanIds: string[] = []) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      services: true,
      responses: true
    }
  });

  if (!job) {
    throw new Error('Job not found');
  }

  const serviceIds = job.services.map(s => s.serviceId);

  let tradesmen = await prisma.tradesman.findMany({
    where: {
      isApproved: true,
      isVisible: true,
      city: job.city,
      services: {
        some: {
          serviceId: {
            in: serviceIds
          }
        }
      },
      id: {
        notIn: [...excludeTradesmanIds, ...job.responses.map(r => r.tradesmanId)]
      }
    },
    include: {
      user: true,
      services: true
    },
    orderBy: [
      { rating: 'desc' },
      { reviewCount: 'desc' }
    ]
  });

  if (tradesmen.length === 0) {
    tradesmen = await prisma.tradesman.findMany({
      where: {
        isApproved: true,
        isVisible: true,
        services: {
          some: {
            serviceId: {
              in: serviceIds
            }
          }
        },
        id: {
          notIn: [...excludeTradesmanIds, ...job.responses.map(r => r.tradesmanId)]
        }
      },
      include: {
        user: true,
        services: true
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ],
      take: 10
    });
  }

  return tradesmen.slice(0, 3);
}

export async function notifyTradesmenForJob(jobId: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        services: {
          include: {
            service: true
          }
        },
        responses: true
      }
    });

    if (!job) {
      console.error('Job not found:', jobId);
      return;
    }

    if (job.acceptedCount >= job.maxAcceptances) {
      console.log('Job already has maximum acceptances:', jobId);
      return;
    }

    const pendingCount = job.responses.filter(r => r.status === 'PENDING').length;
    const neededCount = 3 - pendingCount;

    if (neededCount <= 0) {
      console.log('Already have enough pending responses for job:', jobId);
      return;
    }

    const respondedTradesmanIds = job.responses.map(r => r.tradesmanId);
    const matchingTradesmen = await findMatchingTradesmen(jobId, respondedTradesmanIds);

    const tradesToNotify = matchingTradesmen.slice(0, neededCount);

    for (const tradesman of tradesToNotify) {
      const jobResponse = await prisma.jobResponse.create({
        data: {
          jobId: job.id,
          tradesmanId: tradesman.id,
          status: 'PENDING'
        }
      });

      const serviceNames = job.services.map(s => s.service.name).join(', ');
      const jobDescription = `${serviceNames}\nLocation: ${job.location}\n${job.description || ''}`;
      
      const acceptUrl = `${process.env.FRONTEND_URL}/tradesman/jobs/${job.jobId}/accept`;
      const declineUrl = `${process.env.FRONTEND_URL}/tradesman/jobs/${job.jobId}/decline`;

      await sendJobNotificationToTradesman(
        {
          email: tradesman.user.email || undefined,
          whatsapp: tradesman.user.whatsapp!
        },
        job.jobId,
        jobDescription,
        acceptUrl,
        declineUrl
      );

      console.log(`Notified tradesman ${tradesman.tradesmanId} for job ${job.jobId}`);
    }

    if (tradesToNotify.length === 0) {
      console.log('No matching tradesmen found for job:', jobId);
    }
  } catch (error) {
    console.error('Error notifying tradesmen for job:', error);
  }
}

export async function handleJobTimeout(jobResponseId: string) {
  try {
    const jobResponse = await prisma.jobResponse.findUnique({
      where: { id: jobResponseId },
      include: {
        job: true,
        tradesman: {
          include: {
            user: true
          }
        }
      }
    });

    if (!jobResponse || jobResponse.status !== 'PENDING') {
      return;
    }

    await prisma.jobResponse.update({
      where: { id: jobResponseId },
      data: {
        status: 'TIMEOUT'
      }
    });

    console.log(`Job response timed out: ${jobResponseId}`);

    await notifyTradesmenForJob(jobResponse.job.id);
  } catch (error) {
    console.error('Error handling job timeout:', error);
  }
}

export async function sendReminderToTradesman(jobResponseId: string) {
  try {
    const jobResponse = await prisma.jobResponse.findUnique({
      where: { id: jobResponseId },
      include: {
        job: true,
        tradesman: {
          include: {
            user: true
          }
        }
      }
    });

    if (!jobResponse || jobResponse.status !== 'PENDING') {
      return;
    }

    if (jobResponse.reminderCount >= 2) {
      await handleJobTimeout(jobResponseId);
      return;
    }

    await prisma.jobResponse.update({
      where: { id: jobResponseId },
      data: {
        reminderCount: { increment: 1 },
        lastReminderAt: new Date()
      }
    });

    await sendWhatsApp(
      jobResponse.tradesman.user.whatsapp!,
      `Reminder: You have a pending job request (${jobResponse.job.jobId}). Please respond soon to avoid missing this opportunity!`
    );

    console.log(`Sent reminder ${jobResponse.reminderCount + 1} to tradesman ${jobResponse.tradesman.tradesmanId} for job ${jobResponse.job.jobId}`);
  } catch (error) {
    console.error('Error sending reminder:', error);
  }
}
