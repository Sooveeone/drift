import express from 'express';
import {
  createSchedule,
  getUserSchedules,
  getScheduleById,
  updateScheduleProgress,
  deleteSchedule
} from '../controllers/scheduleController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create a new schedule
router.post('/', createSchedule);

// Get all schedules for the authenticated user
router.get('/', getUserSchedules);

// Get a specific schedule by ID
router.get('/:scheduleId', getScheduleById);

// Update schedule progress
router.put('/:scheduleId/progress', updateScheduleProgress);

// Delete a schedule
router.delete('/:scheduleId', deleteSchedule);

export default router;
