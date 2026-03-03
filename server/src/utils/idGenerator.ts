import { prisma } from '../index.js';

function generateNextId(current: string, prefix: string, maxNum: number): string {
  const letters = current.slice(0, prefix.length);
  const numbers = parseInt(current.slice(prefix.length));

  if (numbers < maxNum) {
    return letters + String(numbers + 1).padStart(String(maxNum).length, '0');
  }

  let nextLetters = '';
  let carry = 1;
  
  for (let i = letters.length - 1; i >= 0; i--) {
    if (carry === 0) {
      nextLetters = letters[i] + nextLetters;
      continue;
    }
    
    if (letters[i] === 'Z') {
      nextLetters = 'A' + nextLetters;
    } else {
      nextLetters = String.fromCharCode(letters.charCodeAt(i) + 1) + nextLetters;
      carry = 0;
    }
  }
  
  return nextLetters + '0'.repeat(String(maxNum).length);
}

export async function generateJobId(): Promise<string> {
  const lastJob = await prisma.job.findFirst({
    orderBy: { jobId: 'desc' },
    select: { jobId: true },
  });

  if (!lastJob) {
    return 'AAA000';
  }

  return generateNextId(lastJob.jobId, 'AAA', 999);
}

export async function generateTradesmanId(): Promise<string> {
  const lastTradesman = await prisma.tradesman.findFirst({
    orderBy: { tradesmanId: 'desc' },
    select: { tradesmanId: true },
  });

  if (!lastTradesman) {
    return 'AA00';
  }

  return generateNextId(lastTradesman.tradesmanId, 'AA', 99);
}
