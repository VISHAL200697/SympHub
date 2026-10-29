import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB, { getDbError } from './db.js';
import User from './models/User.js';
import { seedData } from './seed.js';

// Route Imports
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import registrationRoutes from './routes/registrations.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

// Connect to MongoDB & automatically seed if database is empty
connectDB()
  .then(async () => {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 Fresh/empty database detected. Auto-seeding initial data...');
        await seedData(false);
        console.log('✅ Auto-seed completed successfully!');
      }
    } catch (err) {
      console.error('Auto-seed check notice:', err.message);
    }
  })
  .catch((err) => console.error('MongoDB initial connection error:', err?.message));

const app = express();

// Global Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.pages.dev') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Domain Routers
app.use('/auth', authRoutes);
app.use('/', eventRoutes);
app.use('/', registrationRoutes);
app.use('/admin', adminRoutes);

// Health Check
app.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.json({
    status: 'online',
    database: dbStatus,
    database_error: dbStatus !== 'connected' ? getDbError() : null,
    service: 'Symposium Management MERN Backend API (Node.js + Express + MongoDB)',
    version: '1.0.0',
  });
});

// Web-based Seed Trigger (Free alternative to Render Shell)
app.all('/api/seed', async (req, res) => {
  try {
    const key = req.query.key || req.body?.key;
    const expectedKey = process.env.SEED_KEY || process.env.JWT_SECRET;
    if (process.env.NODE_ENV === 'production' && expectedKey && key !== expectedKey) {
      return res.status(401).json({
        error: 'Unauthorized. Provide valid ?key=<your_jwt_secret> in the URL to run seed.',
      });
    }
    const result = await seedData(false);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ detail: `Route ${req.originalUrl} not found.` });
});

// Inline Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Server error stack:', err.stack || err);
  const statusCode = err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  res.status(statusCode).json({
    detail: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Symposium Node.js MERN Backend listening on 0.0.0.0:${PORT}`);
});

export default app;
