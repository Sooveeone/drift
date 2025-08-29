import express from 'express';
import { generateSchedule } from '../controllers/huggingfaceController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/schedule', protect, generateSchedule);

export default router;