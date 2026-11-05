import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// CORS: fakt tamara frontend ne allow, cookies sathe (credentials)
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// JSON vanchva (nano limit: moti request nakami)
app.use(express.json({ limit: '10kb' }));

// Cookies vanchva (refresh token mate)
app.use(cookieParser());

// Home
app.get('/', (req, res) => {
  res.send('Smart Student Management System API is running');
});

// Badha API routes: /api/...
app.use('/api', routes);

// Aa 2 hamesha SAUTHI LAST ma
app.use(notFound);
app.use(errorHandler);

export default app;