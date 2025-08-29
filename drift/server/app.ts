import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import goalRoutes from './routes/goalRoutes';
import authRoutes from './routes/authRoutes';
import huggingfaceRoutes from './routes/huggingfaceRoutes';
import achievementRoutes from './routes/achievementRoutes';
import scheduleRoutes from './routes/scheduleRoutes';

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());


app.use(cookieParser());

// Images now served from S3 directly, no local static files needed

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ message: 'Drift backend live' });
});

app.use('/api/goals', goalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/huggingface', huggingfaceRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/schedules', scheduleRoutes);


export default app; 