import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

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

// Home
app.get('/', (req, res) => {
  res.send('Smart Student Management System API is running');
});

// Badha API routes: /api/...
app.use('/api', routes);

// Aa 2 hamesha SAUTHI LAST ma hova joie
app.use(notFound);
app.use(errorHandler);

export default app;