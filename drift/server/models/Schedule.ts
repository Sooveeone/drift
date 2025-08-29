import mongoose, { Document } from 'mongoose';

export interface ISchedule extends Document {
  userId: mongoose.Types.ObjectId;
  goalName: string;
  objective: string;
  deadline: string;
  dedication: string;
  isManual: boolean;
  scheduleData: string;
  totalTasks: number;
  progress?: boolean[][];
  completedTasks?: number;
  progressPercentage?: number;
  isCompleted?: boolean;
  lastUpdated?: Date;
  createdAt: Date;
}

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalName: { type: String, required: true },
  objective: { type: String, required: true },
  deadline: { type: String, required: true },
  dedication: { type: String, required: true },
  isManual: { type: Boolean, default: false },
  scheduleData: { type: String, required: true },
  totalTasks: { type: Number, required: true },
  progress: { type: [[Boolean]], default: [] },
  completedTasks: { type: Number, default: 0 },
  progressPercentage: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISchedule>('Schedule', scheduleSchema);