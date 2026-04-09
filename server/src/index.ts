import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import jobRoutes from './routes/job.js';
import tradesmanRoutes from './routes/tradesman.js';
import serviceRoutes from './routes/service.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import creditRoutes from './routes/credit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { verifyEmailConnection } from './utils/notifications.js';
import { startJobMonitoring } from './services/jobMonitor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

export const prisma = new PrismaClient();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  'http://localhost:5173',
  'https://workers-zad5.onrender.com',
  'https://www.worknfix.com',
  'https://worknfix.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

app.use('/uploads', express.static(uploadsDir));
console.log('Serving uploads from:', uploadsDir);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/tradesman', tradesmanRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/credit', creditRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    // Verify email connection
    await verifyEmailConnection();

    startJobMonitoring();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
