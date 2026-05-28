// Keep server alive by pinging itself every 10 minutes
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const SERVER_URL = process.env.SERVER_URL || 'https://workersplace.onrender.com';

export const startKeepAlive = () => {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('⏭️  Keep-alive disabled in development');
    return;
  }

  console.log('🔄 Starting keep-alive service...');
  console.log(`📍 Pinging ${SERVER_URL}/api/health every 10 minutes`);

  // Initial ping after 1 minute
  setTimeout(() => {
    pingServer();
  }, 60 * 1000);

  // Then ping every 10 minutes
  setInterval(() => {
    pingServer();
  }, PING_INTERVAL);
};

const pingServer = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/health`);
    const data = await response.json() as { status: string; timestamp: string };
    console.log('✅ Keep-alive ping successful:', data.timestamp);
  } catch (error) {
    console.error('❌ Keep-alive ping failed:', error);
  }
};
