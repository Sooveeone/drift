import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import DriftLogo from '../../assets/drift_logo.svg';
import MakeItHappenFloat from '../../assets/makeithappen_float.svg';
import { useNavigate } from "react-router-dom";
import { scheduleAPI } from "../../services/api";

interface ScheduleTask {
  id: string;
  text: string;
}

interface ScheduleDay {
  id: string;
  date: string;
  tasks: ScheduleTask[];
}

// Magical Make It Happen Button component
interface MagicalButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const MagicalButton: React.FC<MagicalButtonProps> = ({ onClick, disabled }) => {
  return (
    <div className="relative">
      {/* Floating magical elements */}
      <div className="absolute inset-0 -top-8 -left-6 -right-6 -bottom-8 pointer-events-none">
        <img 
          src={MakeItHappenFloat} 
          alt="Magical elements" 
          className="w-full h-full object-contain animate-magicalFloat opacity-80"
        />
      </div>
      
      {/* Glowing effects */}
      <div className="absolute inset-0 rounded-full bg-white/10 blur-md animate-glow"></div>
      
      {/* Sparkles */}
      <div className="absolute -top-2 left-1/4 w-1 h-1 bg-white rounded-full animate-sparkle1"></div>
      <div className="absolute -top-3 left-2/3 w-2 h-2 bg-white rounded-full animate-sparkle2"></div>
      <div className="absolute -bottom-2 right-1/4 w-1.5 h-1.5 bg-white rounded-full animate-sparkle3"></div>
      
      {/* Button itself */}
      <button
        onClick={onClick}
        disabled={disabled}
        className="relative px-8 py-5 bg-white/20 backdrop-blur-md text-white rounded-full text-xl font-medium 
                  hover:bg-white/30 transition-all duration-300 w-72 shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                  border border-white/30 z-10
                  group"
      >
        <span className="relative z-10 group-hover:scale-105 transition-transform duration-300 inline-block">
          Make It Happen
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-drift-pink/40 via-drift-purple/30 to-drift-orange/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </button>
    </div>
  );
};

interface ManualScheduleProps {
  sidebarCollapsed: boolean;
}

const ManualSchedule: React.FC<ManualScheduleProps> = ({ sidebarCollapsed }) => {
  const navigate = useNavigate();
  
  // Form state
  const [goalName, setGoalName] = useState('');
  const [objective, setObjective] = useState('');
  const [dedication, setDedication] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Schedule state
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([]);

  // Initialize with empty schedule
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    
    // Create initial 3-day schedule as example
    const initialDays: ScheduleDay[] = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      initialDays.push({
        id: `day-${i}`,
        date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        tasks: []
      });
    }
    setScheduleDays(initialDays);
  }, []);

  const addDay = () => {
    const newDay: ScheduleDay = {
      id: `day-${Date.now()}`,
      date: 'New Day',
      tasks: []
    };
    setScheduleDays([...scheduleDays, newDay]);
  };

  const removeDay = (dayIndex: number) => {
    const newDays = scheduleDays.filter((_, index) => index !== dayIndex);
    setScheduleDays(newDays);
  };

  const updateDayDate = (dayIndex: number, newDate: string) => {
    const updatedDays = [...scheduleDays];
    updatedDays[dayIndex].date = newDate;
    setScheduleDays(updatedDays);
  };

  const addTask = (dayIndex: number) => {
    const newTask: ScheduleTask = {
      id: `task-${Date.now()}`,
      text: ''
    };
    const updatedDays = [...scheduleDays];
    updatedDays[dayIndex].tasks.push(newTask);
    setScheduleDays(updatedDays);
  };

  const removeTask = (dayIndex: number, taskIndex: number) => {
    const updatedDays = [...scheduleDays];
    updatedDays[dayIndex].tasks.splice(taskIndex, 1);
    setScheduleDays(updatedDays);
  };

  const updateTask = (dayIndex: number, taskIndex: number, newText: string) => {
    const updatedDays = [...scheduleDays];
    updatedDays[dayIndex].tasks[taskIndex].text = newText;
    setScheduleDays(updatedDays);
  };

  const saveScheduleToList = async (goalData: any, scheduleData: string, isManual: boolean = false) => {
    try {
      // Count tasks in schedule
      const totalTasks = scheduleData.split(';')
        .filter(day => day.trim())
        .reduce((total, day) => {
          const tasks = day.split('|').slice(1); // Remove date part
          return total + tasks.filter(task => task.trim()).length;
        }, 0);

      const schedulePayload = {
        goalName: goalData.goalName,
        objective: goalData.objective,
        deadline: goalData.deadline,
        dedication: goalData.dedication,
        isManual,
        scheduleData,
        totalTasks
      };

      const savedSchedule = await scheduleAPI.create(schedulePayload);
      return savedSchedule._id;
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!goalName || !objective || !dedication || !startDate || !endDate) {
      return; // Don't submit if missing required fields
    }

    // Validate that schedule has tasks
    const hasAnyTasks = scheduleDays.some(day => day.tasks.length > 0 && day.tasks.some(task => task.text.trim()));
    if (!hasAnyTasks) {
      return; // Don't submit if no tasks defined
    }

    // Convert schedule to format compatible with ScheduleGenerator
    const scheduleString = scheduleDays
      .map(day => {
        const tasksText = day.tasks
          .filter(task => task.text.trim())
          .map(task => task.text.trim())
          .join('|');
        return tasksText ? `${day.date}|${tasksText}` : '';
      })
      .filter(dayString => dayString)
      .join(';');

    // Store manual schedule data in localStorage
    const manualData = {
      goalName,
      objective,
      deadline: endDate,
      dedication,
      category: 'manual', // Mark as manual
      isManual: true
    };

    // Save to schedules list
    const savedSchedule = await saveScheduleToList(manualData, scheduleString, true);
    
    // Add the schedule ID to the goal data so it knows it's an existing schedule
    const manualDataWithId = {
      ...manualData,
      scheduleId: savedSchedule
    };

    localStorage.setItem('goalData', JSON.stringify(manualDataWithId));
    localStorage.setItem('scheduleData', scheduleString);
    localStorage.setItem('scheduleMeta', JSON.stringify({
      objective,
      deadline: endDate,
      dedication,
      isManual: true
    }));

    // Show success message
    setShowSuccessMessage(true);

    // Navigate to schedule execution page
    navigate("/schedule");
    
    // Note: User can navigate to schedules manually when ready, no forced redirect
  };

  // Check if form is valid for submission
  const isFormValid = goalName && objective && dedication && startDate && endDate && 
    scheduleDays.some(day => day.tasks.length > 0 && day.tasks.some(task => task.text.trim()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <img src={DriftLogo} alt="Drift logo" className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">Create Your Manual Schedule</h1>
        <p className="text-white/80 text-lg">Design your own daily action plan</p>
      </div>

        {/* Goal Information Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <h3 className="text-white text-xl font-semibold mb-6 text-center">Goal Information</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Goal Name</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g., Learn Guitar Mastery"
                className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Objective</label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g., Play 5 songs fluently"
                className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Dedication Level</label>
              <select
                value={dedication}
                onChange={(e) => setDedication(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="" className="bg-gray-800">Select level</option>
                <option value="casual" className="bg-gray-800">Casual</option>
                <option value="moderate" className="bg-gray-800">Moderate</option>
                <option value="intense" className="bg-gray-800">Intense</option>
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">Target Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-full font-medium hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg"
          >
            Back to Dashboard
          </button>

          <button
            onClick={addDay}
            className="px-6 py-3 bg-drift-orange/80 backdrop-blur-md text-white rounded-full font-medium hover:bg-drift-orange transition-all duration-300 border border-white/30 shadow-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Day
          </button>
        </div>

        {/* Manual Schedule Editor */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Schedule</h2>
          
          <div className="space-y-6">
            {scheduleDays.map((day, dayIndex) => (
              <div key={day.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={day.date}
                      onChange={(e) => updateDayDate(dayIndex, e.target.value)}
                      className="text-xl font-semibold text-white bg-transparent border-b border-white/30 focus:outline-none focus:border-white/60 pb-1"
                      placeholder="Day name (e.g., Monday, March 1)"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addTask(dayIndex)}
                      className="p-2 bg-drift-blue/80 text-white rounded-lg hover:bg-drift-blue transition-colors"
                      title="Add Task"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    {scheduleDays.length > 1 && (
                      <button
                        onClick={() => removeDay(dayIndex)}
                        className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors"
                        title="Remove Day"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {day.tasks.map((task, taskIndex) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                      <div className="w-6 h-6 rounded-lg border-2 border-white/40 bg-white/10 flex items-center justify-center">
                        <span className="text-white/60 text-sm">{taskIndex + 1}</span>
                      </div>
                      
                      <input
                        type="text"
                        value={task.text}
                        onChange={(e) => updateTask(dayIndex, taskIndex, e.target.value)}
                        placeholder="Enter task description..."
                        className="flex-1 px-3 py-2 bg-transparent text-white placeholder-white/60 border-b border-white/20 focus:outline-none focus:border-white/50"
                      />
                      
                      <button
                        onClick={() => removeTask(dayIndex, taskIndex)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Remove Task"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {day.tasks.length === 0 && (
                    <div className="text-center py-8 text-white/60">
                      <p>No tasks yet. Click the + button to add your first task!</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Make It Happen Section */}
        <div className="flex flex-col items-center justify-center py-16">
          <MagicalButton
            onClick={handleSubmit}
            disabled={!isFormValid}
          />
          
          {!isFormValid && (
            <p className="text-white/60 text-sm mt-6 text-center max-w-md">
              Please fill in all goal information and add at least one task to a day before making it happen!
            </p>
          )}
        </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-emerald-500/20 backdrop-blur-md rounded-lg p-4 border border-emerald-400/30 text-emerald-200 z-50 animate-pulse">
          <p className="font-medium">✅ Schedule saved to Schedules!</p>
        </div>
      )}
    </div>
  );
};

export default ManualSchedule;