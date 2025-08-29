import { Request, Response } from 'express';
import Schedule from '../models/Schedule';
import jwt from 'jsonwebtoken';

// Helper function to get user ID from JWT token
const getUserIdFromToken = (req: Request): string | null => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return decoded.id;
  } catch (error) {
    return null;
  }
};

// Create a new schedule
export const createSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { 
      goalName, 
      objective, 
      deadline, 
      dedication, 
      isManual, 
      scheduleData, 
      totalTasks 
    } = req.body;

    if (!goalName || !objective || !deadline || !dedication || !scheduleData || totalTasks === undefined) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    const newSchedule = new Schedule({
      userId,
      goalName,
      objective,
      deadline,
      dedication,
      isManual: isManual || false,
      scheduleData,
      totalTasks,
      progress: [],
      completedTasks: 0,
      progressPercentage: 0,
      isCompleted: false
    });

    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    res.status(500).json({ message: 'Error creating schedule', error });
  }
};

// Get all schedules for the authenticated user
export const getUserSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const schedules = await Schedule.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedules', error });
  }
};

// Get a specific schedule by ID
export const getScheduleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { scheduleId } = req.params;
    const schedule = await Schedule.findOne({ _id: scheduleId, userId });
    
    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schedule', error });
  }
};

// Update schedule progress
export const updateScheduleProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { scheduleId } = req.params;
    const { progress } = req.body;

    if (!progress) {
      res.status(400).json({ message: 'Progress data is required' });
      return;
    }

    const schedule = await Schedule.findOne({ _id: scheduleId, userId });
    
    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    // Calculate progress statistics
    const totalTasks = progress.reduce((sum: number, dayArr: boolean[]) => sum + dayArr.length, 0);
    const completedTasks = progress.reduce((sum: number, dayArr: boolean[]) => sum + dayArr.filter(Boolean).length, 0);
    const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    const isCompleted = progressPercentage === 100;

    const updatedSchedule = await Schedule.findOneAndUpdate(
      { _id: scheduleId, userId },
      {
        progress,
        completedTasks,
        progressPercentage,
        isCompleted,
        lastUpdated: new Date()
      },
      { new: true }
    );

    res.status(200).json(updatedSchedule);
  } catch (error) {
    res.status(500).json({ message: 'Error updating schedule progress', error });
  }
};

// Delete a schedule
export const deleteSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { scheduleId } = req.params;
    const schedule = await Schedule.findOneAndDelete({ _id: scheduleId, userId });
    
    if (!schedule) {
      res.status(404).json({ message: 'Schedule not found' });
      return;
    }

    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting schedule', error });
  }
};

