import express from 'express';
import cors from 'cors';
import prisma from './config/db.js';

const app = express();

// CORS: fakt tamara frontend ne backend vapravani permission
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Frontend mathi aavta JSON data ne vanchva mate
app.use(express.json());

// Test route 1: home
app.get('/', (req, res) => {
  res.send('Smart Student Management System API is running');
});

// Test route 2: health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working correctly',
    timestamp: new Date().toISOString(),
  });
});

// Test route 3: database check
app.get('/api/db-health', async (req, res) => {
  try {
    const [users, departments, semesters, subjects] = await Promise.all([
      prisma.user.count(),
      prisma.department.count(),
      prisma.semester.count(),
      prisma.subject.count(),
    ]);

    res.json({
      success: true,
      message: 'Database connected successfully',
      counts: { users, departments, semesters, subjects },
    });
  } catch (error) {
    console.error('DB error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
    });
  }
});

export default app;