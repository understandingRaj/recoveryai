import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { seedDatabaseIfEmpty } from './config/seed.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import followUpRoutes from './routes/followUpRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then((connected) => {
  if (connected) {
    seedDatabaseIfEmpty();
  }
});

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development
    },
    credentials: true
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP logger in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'RecoverAI Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', reportRoutes); // Contains /dashboard/summary, /dashboard/collection-trend, /reports/receivables, /activities

// Root route
app.get('/', (req, res) => {
  res.send('RecoverAI API is active and running.');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[RecoverAI API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
