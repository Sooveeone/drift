import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Target, Trash2, Play, Bot, Edit3, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { scheduleAPI } from '../../services/api';

interface SavedSchedule {
  _id: string;
  goalName: string;
  objective: string;
  deadline: string;
  dedication: string;
  createdAt: string;
  isManual: boolean;
  scheduleData: string;
  totalTasks?: number;
  progress?: boolean[][];
  completedTasks?: number;
  progressPercentage?: number;
  isCompleted?: boolean;
  lastUpdated?: string;
}

interface SchedulesPageProps {
  sidebarCollapsed: boolean;
}

const SchedulesPage: React.FC<SchedulesPageProps> = ({ sidebarCollapsed }) => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<SavedSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Load schedules from API
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        const userSchedules = await scheduleAPI.getAll();
        setSchedules(userSchedules.sort((a: SavedSchedule, b: SavedSchedule) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      } catch (error) {
        console.error('Error loading schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, []);

  const deleteSchedule = async (scheduleId: string) => {
    try {
      await scheduleAPI.delete(scheduleId);
      const updatedSchedules = schedules.filter(schedule => schedule._id !== scheduleId);
      setSchedules(updatedSchedules);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const openSchedule = (schedule: SavedSchedule) => {
    // Set the schedule data for the ScheduleGenerator to load
    const goalData = {
      goalName: schedule.goalName,
      objective: schedule.objective,
      deadline: schedule.deadline,
      dedication: schedule.dedication,
      isManual: schedule.isManual,
      scheduleId: schedule._id,
      category: schedule.isManual ? 'manual' : 'work' // Add category to prevent regeneration
    };

    localStorage.setItem('goalData', JSON.stringify(goalData));
    localStorage.setItem('scheduleData', schedule.scheduleData);
    localStorage.setItem('scheduleMeta', JSON.stringify({
      totalTasks: schedule.totalTasks,
      progress: schedule.progress || [],
      completedTasks: schedule.completedTasks || 0,
      progressPercentage: schedule.progressPercentage || 0,
      isCompleted: schedule.isCompleted || false
    }));

    // Navigate to schedule execution page
    navigate('/schedule');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (deadline: string) => {
    const daysLeft = getDaysUntilDeadline(deadline);
    if (daysLeft < 0) return 'text-red-400';
    if (daysLeft <= 7) return 'text-orange-400';
    if (daysLeft <= 30) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusText = (deadline: string) => {
    const daysLeft = getDaysUntilDeadline(deadline);
    if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
    if (daysLeft === 0) return 'Due today';
    if (daysLeft === 1) return 'Due tomorrow';
    return `${daysLeft} days left`;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Your Schedules</h1>
        <p className="text-white/80 text-lg">All your created schedules in one place</p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
          <p className="text-white/80 text-lg">Loading your schedules...</p>
        </div>
      ) : (
        <>
          {/* Schedules Grid */}
          {schedules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule) => (
              <div
                key={schedule._id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group cursor-pointer"
                onClick={() => openSchedule(schedule)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${schedule.isManual ? 'bg-edit-500/20' : 'bg-drift-blue/20'}`}>
                      {schedule.isManual ? (
                        <Edit3 className="h-5 w-5 text-white" />
                      ) : (
                        <Bot className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        schedule.isManual 
                          ? 'bg-purple-500/20 text-purple-200' 
                          : 'bg-blue-500/20 text-blue-200'
                      }`}>
                        {schedule.isManual ? 'Manual' : 'AI Generated'}
                      </span>
                      {schedule.isCompleted && (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-200 font-medium">
                          ✅ Completed
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSchedule(schedule._id);
                    }}
                    className="p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Schedule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Goal Name */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-drift-orange transition-colors" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {schedule.goalName}
                </h3>

                {/* Objective */}
                <p className="text-white/70 text-sm mb-4" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {schedule.objective}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Target className="h-4 w-4" />
                    <span className="capitalize">{schedule.dedication} intensity</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Due {formatDate(schedule.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Created {formatDate(schedule.createdAt)}</span>
                  </div>
                  {schedule.totalTasks && (
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <span className="w-4 h-4 flex items-center justify-center text-xs bg-white/20 rounded">✓</span>
                      <span>
                        {schedule.completedTasks || 0} of {schedule.totalTasks} tasks
                        {schedule.progressPercentage !== undefined && (
                          <span className="ml-1 font-medium text-drift-orange">
                            ({schedule.progressPercentage}%)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {schedule.progressPercentage !== undefined && (
                  <div className="mb-4">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          schedule.isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-drift-orange to-drift-pink'
                        }`}
                        style={{ width: `${schedule.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <div className="flex items-center gap-2">
                    {schedule.isCompleted ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <span className="text-sm font-medium text-emerald-400">Completed</span>
                      </>
                    ) : (
                      <>
                        <div className={`w-2 h-2 rounded-full ${
                          getDaysUntilDeadline(schedule.deadline) < 0 ? 'bg-red-400' :
                          getDaysUntilDeadline(schedule.deadline) <= 7 ? 'bg-orange-400' :
                          getDaysUntilDeadline(schedule.deadline) <= 30 ? 'bg-yellow-400' :
                          'bg-green-400'
                        }`}></div>
                        <span className={`text-sm font-medium ${getStatusColor(schedule.deadline)}`}>
                          {getStatusText(schedule.deadline)}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-4 w-4" />
                    <span className="text-sm">Open</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 max-w-md mx-auto">
              <Calendar className="h-16 w-16 text-white/60 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No Schedules Yet</h3>
              <p className="text-white/70 mb-6">
                Create your first schedule using the Dashboard or Manual Schedule tabs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-drift-blue/80 text-white rounded-lg font-medium hover:bg-drift-blue transition-all duration-300"
                >
                  AI Schedule
                </button>
                <button
                  onClick={() => navigate('/dashboard/manual')}
                  className="px-6 py-3 bg-drift-orange/80 text-white rounded-lg font-medium hover:bg-drift-orange transition-all duration-300"
                >
                  Manual Schedule
                </button>
              </div>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default SchedulesPage;
