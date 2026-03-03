import { prisma } from '../index.js';
import { sendReminderToTradesman } from './jobMatcher.js';

const REMINDER_INTERVAL = 60 * 60 * 1000;
const CHECK_INTERVAL = 5 * 60 * 1000;

export function startJobMonitoring() {
  console.log('Starting job monitoring service...');

  setInterval(async () => {
    try {
      await checkPendingResponses();
    } catch (error) {
      console.error('Error in job monitoring:', error);
    }
  }, CHECK_INTERVAL);

  console.log('Job monitoring service started');
}

async function checkPendingResponses() {
  const pendingResponses = await prisma.jobResponse.findMany({
    where: {
      status: 'PENDING',
      job: {
        acceptedCount: {
          lt: 3
        }
      }
    },
    include: {
      job: true,
      tradesman: {
        include: {
          user: true
        }
      }
    }
  });

  const now = new Date();

  for (const response of pendingResponses) {
    const timeSinceNotification = now.getTime() - response.notifiedAt.getTime();
    const timeSinceLastReminder = response.lastReminderAt 
      ? now.getTime() - response.lastReminderAt.getTime()
      : timeSinceNotification;

    if (response.reminderCount === 0 && timeSinceNotification >= REMINDER_INTERVAL) {
      await sendReminderToTradesman(response.id);
    }
    else if (response.reminderCount === 1 && timeSinceLastReminder >= REMINDER_INTERVAL) {
      await sendReminderToTradesman(response.id);
    }
    else if (response.reminderCount >= 2 && timeSinceLastReminder >= REMINDER_INTERVAL) {
      await sendReminderToTradesman(response.id);
    }
  }
}
