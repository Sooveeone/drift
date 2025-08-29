import React, { useEffect, useState } from 'react';
import { Target, Camera, X, Upload, ChevronLeft } from 'lucide-react';
import { generateSchedule } from '../services/huggingfaceService';
import { createAchievement, createAchievementWithImages } from '../services/achievementService';
import DriftLogo from '../assets/drift_logo.svg';
import { useNavigate } from "react-router-dom";
import { scheduleAPI } from "../services/api";

// Beautiful Loading Component
const DriftLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-drift-orange via-drift-pink to-drift-blue flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="animate-pulse">
            <img src={DriftLogo} alt="Drift logo" className="h-32 w-32 mx-auto animate-spin-slow" />
          </div>
          {/* Floating particles */}
          <div className="absolute -top-4 -left-4 w-2 h-2 bg-white rounded-full animate-ping"></div>
          <div className="absolute -top-2 -right-6 w-1 h-1 bg-white rounded-full animate-ping animation-delay-200"></div>
          <div className="absolute -bottom-3 -left-2 w-1.5 h-1.5 bg-white rounded-full animate-ping animation-delay-500"></div>
          <div className="absolute -bottom-4 -right-4 w-2 h-2 bg-white rounded-full animate-ping animation-delay-700"></div>
        </div>
        
        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white animate-pulse">
            Crafting Your Perfect Schedule
          </h2>
          <p className="text-white/80 text-lg animate-fade-in-up">
            Our AI is analyzing your goals and creating a personalized plan...
          </p>
          
          {/* Loading Bar */}
          <div className="w-80 mx-auto mt-8">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-white via-drift-mauve to-white rounded-full animate-loading-bar"></div>
            </div>
          </div>
          
          {/* Loading Steps */}
          <div className="mt-8 space-y-2 text-white/70">
            <div className="flex items-center justify-center space-x-2 animate-fade-in-up animation-delay-1000">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Analyzing your goal complexity...</span>
            </div>
            <div className="flex items-center justify-center space-x-2 animate-fade-in-up animation-delay-2000">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Calculating optimal task distribution...</span>
            </div>
            <div className="flex items-center justify-center space-x-2 animate-fade-in-up animation-delay-3000">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Generating your personalized schedule...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScheduleGenerator: React.FC = () => {
  const navigate = useNavigate();

  const [goal, setGoal] = useState('');
  const [goalName, setGoalName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [intensity, setIntensity] = useState('');
  const [schedule, setSchedule] = useState('');
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<{ date: string; tasks: string[] }[]>([]);
  const [checked, setChecked] = useState<boolean[][]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [goalSaved, setGoalSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false); // Prevent duplicate initialization
  const [isSaving, setIsSaving] = useState(false); // Prevent duplicate saves

  // Helper to parse schedule string into table data
  const parseScheduleToTable = (scheduleStr: string) => {
    return scheduleStr
      .split(';')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const [date, ...tasks] = line.split('|').map(s => s.trim());
        return { date, tasks };
      })
      .filter(row => row.date && row.tasks.length > 0);
  };

  const saveScheduleToList = async (goalData: any, scheduleData: string, isManual: boolean = false) => {
    // Prevent duplicate saves
    if (isSaving) {
      console.log('Save already in progress, skipping...');
      return null;
    }
    
    try {
      setIsSaving(true);
      
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
      // If there's an error, try to continue without saving
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // Prevent multiple initializations - check localStorage flag first
    const initKey = 'schedule_initializing';
    if (localStorage.getItem(initKey) === 'true' || hasInitialized) {
      return;
    }
    
    // Set initialization flag
    localStorage.setItem(initKey, 'true');
    setHasInitialized(true);
    
    const stored = localStorage.getItem('goalData');
    const storedSchedule = localStorage.getItem('scheduleData');
    const storedMeta = localStorage.getItem('scheduleMeta');
    
    if (stored) {
      const data = JSON.parse(stored);
      setGoal(data.objective || '');
      setGoalName(data.goalName || '');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(data.deadline || '');
      setIntensity(data.dedication || '');

      const meta = JSON.stringify({
        objective: data.objective,
        deadline: data.deadline,
        dedication: data.dedication,
        isManual: data.isManual || false
      });

      // Check if this is an existing schedule (has scheduleId) - prioritize this check
      if (data.scheduleId && storedSchedule) {
        // This is an existing schedule being viewed - load it directly
        setSchedule(storedSchedule);
        const parsed = parseScheduleToTable(storedSchedule);
        setTableData(parsed);
        
        // Load existing progress from scheduleMeta if available
        if (storedMeta) {
          const metaData = JSON.parse(storedMeta);
          if (metaData.progress && Array.isArray(metaData.progress)) {
            setChecked(metaData.progress);
          } else {
            setChecked(parsed.map(day => day.tasks.map(() => false)));
          }
        } else {
          setChecked(parsed.map(day => day.tasks.map(() => false)));
        }
        localStorage.removeItem('schedule_initializing');
      } else if (storedSchedule && storedMeta === meta) {
        // Use existing schedule data (either AI or manual)
        setSchedule(storedSchedule);
        const parsed = parseScheduleToTable(storedSchedule);
        setTableData(parsed);
        
        // Load existing progress if available
        const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules') || '[]');
        const existingSchedule = savedSchedules.find((s: any) => 
          s.goalName === data.goalName && 
          s.objective === data.objective && 
          s.deadline === data.deadline &&
          s.isManual === (data.isManual || false)
        );
        
        if (existingSchedule && existingSchedule.progress) {
          setChecked(existingSchedule.progress);
        } else {
          setChecked(parsed.map(day => day.tasks.map(() => false)));
        }
        localStorage.removeItem('schedule_initializing');
      } else if (data.isManual && storedSchedule) {
        // Manual schedule - use the stored data directly
        setSchedule(storedSchedule);
        const parsed = parseScheduleToTable(storedSchedule);
        setTableData(parsed);
        
        // Load existing progress if available
        const savedSchedules = JSON.parse(localStorage.getItem('savedSchedules') || '[]');
        const existingSchedule = savedSchedules.find((s: any) => 
          s.goalName === data.goalName && 
          s.objective === data.objective && 
          s.deadline === data.deadline &&
          s.isManual === true
        );
        
        if (existingSchedule && existingSchedule.progress) {
          setChecked(existingSchedule.progress);
        } else {
          setChecked(parsed.map(day => day.tasks.map(() => false)));
        }
        localStorage.setItem('scheduleMeta', meta);
        
        // Note: Manual schedules are saved when created in ManualSchedule component
        // No need to save again when viewing existing schedule
        localStorage.removeItem('schedule_initializing');
      } else if (data.objective && data.deadline && data.dedication && !data.isManual) {
        // AI-generated schedule
        setLoading(true);
        generateSchedule(data.objective, new Date().toISOString().split('T')[0], data.deadline, data.dedication, data.category)
          .then(result => {
            setSchedule(result);
            const parsed = parseScheduleToTable(result);
            setTableData(parsed);
            setChecked(parsed.map(day => day.tasks.map(() => false)));
            localStorage.setItem('scheduleData', result);
            localStorage.setItem('scheduleMeta', meta);
            
            // Only save AI schedule to list if it's a new schedule (no scheduleId means it's new)
            if (!data.scheduleId) {
              saveScheduleToList(data, result, false).then(scheduleId => {
                if (scheduleId) {
                  // Update the stored goal data with the schedule ID
                  const updatedData = { ...data, scheduleId };
                  localStorage.setItem('goalData', JSON.stringify(updatedData));
                }
                // Clear initialization flag after successful save
                localStorage.removeItem('schedule_initializing');
              });
            } else {
              // Clear initialization flag for existing schedules
              localStorage.removeItem('schedule_initializing');
            }
          })
          .catch(error => {
            console.error('AI generation failed:', error);
            // Set a user-friendly error message for display
            setSchedule('Failed to generate schedule. Please try again.');
            setTableData([]);
            setChecked([]);
            // Clear initialization flag on error
            localStorage.removeItem('schedule_initializing');
          })
          .finally(() => setLoading(false));
      } else {
        // Clear initialization flag if no conditions are met
        localStorage.removeItem('schedule_initializing');
      }
    } else {
      // Clear initialization flag if no stored data
      localStorage.removeItem('schedule_initializing');
    }
  }, []); // Empty dependency array - should only run once on mount

  const allDates = tableData.map(row => row.date);
  const maxTasks = Math.max(...tableData.map(row => row.tasks.length), 0);

  const updateScheduleProgress = async (newChecked: boolean[][]) => {
    // Update the saved schedule with current progress
    const stored = localStorage.getItem('goalData');
    if (stored) {
      const goalData = JSON.parse(stored);
      
      // Check if we have a scheduleId (for saved schedules)
      if (goalData.scheduleId) {
        try {
          await scheduleAPI.updateProgress(goalData.scheduleId, newChecked);
        } catch (error) {
          console.error('Error updating schedule progress:', error);
        }
      }
    }
  };

  const handleCheckboxChange = (dayIdx: number, taskIdx: number) => {
    setChecked(prev => {
      // Safety check to prevent invalid indices
      if (dayIdx < 0 || dayIdx >= prev.length || taskIdx < 0 || taskIdx >= prev[dayIdx].length) {
        console.warn('Invalid checkbox indices:', dayIdx, taskIdx);
        return prev;
      }
      
      const updated = prev.map(arr => [...arr]);
      updated[dayIdx][taskIdx] = !updated[dayIdx][taskIdx];
      
      // Update saved schedule progress (but only for existing schedules)
      const stored = localStorage.getItem('goalData');
      if (stored) {
        const goalData = JSON.parse(stored);
        if (goalData.scheduleId) {
          updateScheduleProgress(updated);
        }
      }
      
      return updated;
    });
  };

  const totalTasks = tableData.reduce((sum, day) => sum + day.tasks.length, 0);
  const completedTasks = checked.reduce(
    (sum, dayArr) => sum + dayArr.filter(Boolean).length,
    0
  );
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Check if goal should be saved when 100% is reached
  useEffect(() => {
    // Only trigger achievement save for schedules that have been properly initialized
    if (progress === 100 && !goalSaved && !showSaveModal && goalName.trim() && hasInitialized) {
      // Check if this goal was already saved to prevent duplicate saves
      const savedKey = `goal_saved_${goalName}_${endDate}`;
      const alreadySaved = localStorage.getItem(savedKey);
      
      if (!alreadySaved) {
        setShowSaveModal(true);
      } else {
        setGoalSaved(true);
      }
    }
  }, [progress, goalSaved, showSaveModal, goalName, endDate, hasInitialized]);

  const saveGoal = async () => {
    try {
      setSaveError(null);
      
      const achievementData = {
        name: goalName,
        objective: goal,
        deadline: endDate,
        dedication: intensity,
        completedDate: new Date().toISOString(),
        totalTasks: totalTasks
      };

      console.log('Attempting to save achievement:', achievementData);
      await createAchievement(achievementData);
      
      // Mark this goal as saved to prevent duplicate saves
      const savedKey = `goal_saved_${goalName}_${endDate}`;
      localStorage.setItem(savedKey, 'true');
      
      setGoalSaved(true);
      setShowSaveModal(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving achievement:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save achievement');
      // Don't close modal on error, let user try again
    }
  };

  const skipSave = () => {
    // Mark this goal as saved (skipped) to prevent modal from appearing again
    const savedKey = `goal_saved_${goalName}_${endDate}`;
    localStorage.setItem(savedKey, 'skipped');
    
    setGoalSaved(true);
    setShowSaveModal(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 10 - uploadedImages.length); // Limit to 10 total images
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const saveGoalWithImages = async () => {
    try {
      setSaveError(null);
      
      const achievementData = {
        name: goalName,
        objective: goal,
        deadline: endDate,
        dedication: intensity,
        completedDate: new Date().toISOString(),
        totalTasks: totalTasks
      };

      console.log('Attempting to save achievement with images:', achievementData, uploadedImages);
      
      if (uploadedImages.length > 0) {
        await createAchievementWithImages(achievementData, uploadedImages);
      } else {
        await createAchievement(achievementData);
      }
      
      // Mark this goal as saved to prevent duplicate saves
      const savedKey = `goal_saved_${goalName}_${endDate}`;
      localStorage.setItem(savedKey, 'true');
      
      setGoalSaved(true);
      setShowSaveModal(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving achievement:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save achievement');
      // Don't close modal on error, let user try again
    }
  };

  if (loading) {
    return <DriftLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-drift-orange via-drift-pink to-drift-blue">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard/schedules")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full font-medium hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Schedules
          </button>
        </div>

        {/* Header Section */}
        <div className="text-center mb-8">
          <img src={DriftLogo} alt="Drift logo" className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">
            {(() => {
              const stored = localStorage.getItem('goalData');
              const isManual = stored ? JSON.parse(stored).isManual : false;
              return isManual ? 'Your Manual Schedule' : 'Your Personalized Schedule';
            })()}
          </h1>
          <p className="text-white/80 text-lg">
            {(() => {
              const stored = localStorage.getItem('goalData');
              const isManual = stored ? JSON.parse(stored).isManual : false;
              return isManual ? 'Your custom plan to achieve your goals' : "Drift's plan to achieve your goals";
            })()}
          </p>
        </div>

        {/* Goal Name Input */}
        {!goalName && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
            <div className="text-center">
              <h3 className="text-white text-lg font-semibold mb-4">Give your goal a name</h3>
              <div className="flex flex-col items-center space-y-4">
                <input
                  type="text"
                  placeholder="e.g., Learn Guitar Mastery, Fitness Journey, etc."
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full max-w-md px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-center"
                />
                <p className="text-white/60 text-sm">This will help you track and celebrate your achievement!</p>
              </div>
            </div>
          </div>
        )}

        {/* Goal Summary Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {goalName && (
              <div className="text-center">
                <h3 className="text-white/70 text-sm font-medium mb-2">Goal Name</h3>
                <p className="text-white font-semibold">{goalName}</p>
              </div>
            )}
            <div className="text-center">
              <h3 className="text-white/70 text-sm font-medium mb-2">Your Goal</h3>
              <p className="text-white font-semibold">{goal}</p>
            </div>
            <div className="text-center">
              <h3 className="text-white/70 text-sm font-medium mb-2">Start Date</h3>
              <p className="text-white font-semibold">{startDate}</p>
            </div>
            <div className="text-center">
              <h3 className="text-white/70 text-sm font-medium mb-2">Target Date</h3>
              <p className="text-white font-semibold">{endDate}</p>
            </div>
            <div className="text-center">
              <h3 className="text-white/70 text-sm font-medium mb-2">Dedication Level</h3>
              <p className="text-white font-semibold capitalize">{intensity}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard/schedules")}
            className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-full font-medium hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg"
          >
            View All Schedules
          </button>
          
          <button
            onClick={() => setShowImageUpload(!showImageUpload)}
            className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-full font-medium hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg flex items-center gap-2"
          >
            <Camera className="h-5 w-5" />
            Add Photos ({uploadedImages.length})
          </button>
        </div>

        {/* Image Upload Section */}
        {showImageUpload && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
            <h3 className="text-white text-lg font-semibold mb-4 text-center">
              📸 Capture Your Journey
            </h3>
            <p className="text-white/70 text-sm text-center mb-6">
              Upload photos of your progress, achievements, or anything related to your goal!
            </p>
            
            {/* Upload Area */}
            <div className="relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadedImages.length >= 10}
              />
              <div className={`border-2 border-dashed border-white/30 rounded-lg p-8 text-center transition-all duration-300 ${
                uploadedImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/50 hover:bg-white/5 cursor-pointer'
              }`}>
                <Upload className="h-12 w-12 text-white/60 mx-auto mb-4" />
                <p className="text-white/80 font-medium mb-2">
                  {uploadedImages.length >= 10 ? 'Maximum 10 images reached' : 'Click to upload images'}
                </p>
                <p className="text-white/60 text-sm">
                  {uploadedImages.length >= 10 ? '' : `You can upload up to ${10 - uploadedImages.length} more images`}
                </p>
              </div>
            </div>

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3">Uploaded Images ({uploadedImages.length}/10)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-white/20"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {image.name.length > 15 ? `${image.name.substring(0, 15)}...` : image.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedule Table */}
        {tableData.length > 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Daily Action Plan</h2>
            <button
              className="mb-4 ml-4 px-4 py-2 bg-drift-orange text-white rounded hover:bg-drift-pink transition"
              onClick={() => navigate("/dashboard")}
            >
              Go Home
            </button>
            <button
              className="mb-4 px-4 py-2 bg-drift-purple text-white rounded hover:bg-drift-blue transition"
              onClick={() => setChecked(tableData.map(day => day.tasks.map(() => true)))}
            >
              Check All
            </button>
            <div className="overflow-x-auto drift-scrollbar">
              <table className="w-full min-w-[2000px]">
                <thead>
                  <tr>
                    {allDates.map(date => (
                      <th
                        key={date}
                        className="p-4 text-white font-semibold text-center bg-drift-blue/30 border border-white/20 rounded-t-lg"
                      >
                        {date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(maxTasks)].map((_, taskIdx) => (
                    <tr key={taskIdx}>
                      {tableData.map((day, dayIdx) => (
                        <td
                          key={dayIdx}
                          className="p-4 border border-white/20 bg-white/5"
                        >
                          {day.tasks[taskIdx] ? (
                            <div className="flex items-center justify-between space-x-3">
                              <span className="text-white text-sm flex-1">{day.tasks[taskIdx]}</span>
                              <label className="relative cursor-pointer group">
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={checked[dayIdx]?.[taskIdx] || false}
                                  onChange={() => handleCheckboxChange(dayIdx, taskIdx)}
                                />
                                <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center relative overflow-hidden ${
                                  checked[dayIdx]?.[taskIdx] 
                                    ? 'bg-gradient-to-br from-drift-orange via-drift-pink to-drift-mauve border-drift-orange shadow-lg shadow-drift-orange/40 animate-checkbox-glow' 
                                    : 'bg-white/10 border-white/40 hover:border-drift-orange/60 hover:bg-white/20 hover:shadow-md hover:shadow-drift-orange/20 group-hover:scale-105'
                                }`}>
                                  {/* Shimmer effect for unchecked state */}
                                  {!checked[dayIdx]?.[taskIdx] && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                  )}
                                  
                                  {/* Checkmark with animation */}
                                  {checked[dayIdx]?.[taskIdx] && (
                                    <div className="relative">
                                      {/* Glow background */}
                                      <div className="absolute inset-0 bg-white/20 rounded-full blur-sm"></div>
                                      <svg 
                                        className="w-4 h-4 text-white animate-checkbox-check relative z-10" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                      >
                                        <path 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round" 
                                          strokeWidth={3} 
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                  
                                  {/* Sparkle effects for checked state */}
                                  {checked[dayIdx]?.[taskIdx] && (
                                    <>
                                      <div className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full animate-ping"></div>
                                      <div className="absolute -bottom-1 -left-1 w-0.5 h-0.5 bg-white rounded-full animate-ping animation-delay-500"></div>
                                    </>
                                  )}
                                </div>
                              </label>
                            </div>
                          ) : null}
                        </td>
                      ))}
                    </tr>
                  ))}
                  
                  {/* Daily Progress Bars */}
                  <tr>
                    {tableData.map((day, dayIdx) => {
                      const dayTotal = day.tasks.length;
                      const dayCompleted = checked[dayIdx]?.filter(Boolean).length || 0;
                      const dayProgress = dayTotal === 0 ? 0 : Math.round((dayCompleted / dayTotal) * 100);
                      
                      return (
                        <td key={dayIdx} className="p-4 border border-white/20 bg-drift-blue/20">
                          <div className="space-y-2">
                            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  dayProgress === 100 ? 'bg-green-400' : 'bg-drift-orange'
                                }`}
                                style={{ width: `${dayProgress}%` }}
                              />
                            </div>
                            <div className="text-center text-white text-xs">
                              {dayCompleted} of {dayTotal} done
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tree Progress Visualization */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-white mb-8 text-center">Your Growth Journey</h3>
              <div className="max-w-lg mx-auto">
                {/* Tree Container */}
                <div className="relative flex flex-col items-center">
                  {/* Tree Crown/Leaves */}
                  <div className="relative mb-4">
                    {/* Main tree crown */}
                    <div className={`w-32 h-32 rounded-full transition-all duration-1000 ${
                      progress === 100 ? 'bg-gradient-to-br from-emerald-300 via-green-400 to-emerald-600 shadow-2xl shadow-emerald-400/60 animate-tree-complete' :
                      progress >= 80 ? 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 shadow-lg shadow-green-400/40' :
                      progress >= 60 ? 'bg-gradient-to-br from-yellow-400 via-green-400 to-green-500 shadow-lg shadow-yellow-400/40' :
                      progress >= 40 ? 'bg-gradient-to-br from-orange-400 via-yellow-400 to-green-400 shadow-lg shadow-orange-400/40' :
                      progress >= 20 ? 'bg-gradient-to-br from-drift-orange via-orange-400 to-yellow-400 shadow-lg shadow-drift-orange/40' :
                      'bg-gradient-to-br from-white/20 via-white/30 to-drift-orange/40 shadow-lg shadow-white/20'
                    } relative overflow-hidden`}>
                      
                      {/* 100% Completion Special Effects */}
                      {progress === 100 && (
                        <>
                          {/* Radial glow effect */}
                          <div className="absolute inset-0 bg-gradient-radial from-emerald-200/40 via-green-300/30 to-transparent animate-pulse-glow"></div>
                          
                          {/* Multiple sparkle layers */}
                          <div className="absolute top-1 left-2 w-2 h-2 bg-white rounded-full animate-sparkle-burst-1"></div>
                          <div className="absolute top-4 right-2 w-1.5 h-1.5 bg-yellow-200 rounded-full animate-sparkle-burst-2"></div>
                          <div className="absolute bottom-3 left-4 w-2.5 h-2.5 bg-emerald-200 rounded-full animate-sparkle-burst-3"></div>
                          <div className="absolute bottom-1 right-4 w-1 h-1 bg-white rounded-full animate-sparkle-burst-4"></div>
                          <div className="absolute top-8 left-8 w-1.5 h-1.5 bg-green-200 rounded-full animate-sparkle-burst-5"></div>
                          <div className="absolute top-12 right-6 w-1 h-1 bg-white rounded-full animate-sparkle-burst-6"></div>
                          
                          {/* Magical energy waves */}
                          <div className="absolute inset-0 rounded-full border-2 border-emerald-300/50 animate-energy-wave-1"></div>
                          <div className="absolute inset-0 rounded-full border border-green-200/40 animate-energy-wave-2"></div>
                          
                          {/* Success shimmer */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-200/40 to-transparent -translate-x-full animate-success-shimmer"></div>
                        </>
                      )}
                      
                      {/* Regular sparkle effects for 80%+ */}
                      {progress >= 80 && progress < 100 && (
                        <>
                          <div className="absolute top-2 left-4 w-1 h-1 bg-white rounded-full animate-ping"></div>
                          <div className="absolute top-6 right-3 w-1.5 h-1.5 bg-white rounded-full animate-ping animation-delay-300"></div>
                          <div className="absolute bottom-4 left-6 w-1 h-1 bg-white rounded-full animate-ping animation-delay-600"></div>
                          <div className="absolute bottom-2 right-5 w-0.5 h-0.5 bg-white rounded-full animate-ping animation-delay-900"></div>
                        </>
                      )}
                      
                      {/* Growth shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                    </div>
                    
                    {/* Side branches */}
                    <div className={`absolute -left-6 top-8 w-16 h-16 rounded-full transition-all duration-1000 ${
                      progress === 100 ? 'bg-gradient-to-br from-emerald-300 to-green-500 opacity-90 shadow-lg shadow-emerald-400/40 animate-branch-glow' :
                      progress >= 60 ? 'bg-gradient-to-br from-green-400 to-green-500 opacity-80' :
                      progress >= 30 ? 'bg-gradient-to-br from-yellow-400 to-green-400 opacity-60' :
                      'bg-white/10 opacity-40'
                    }`}>
                      {/* 100% branch sparkles */}
                      {progress === 100 && (
                        <>
                          <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full animate-ping"></div>
                          <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-emerald-200 rounded-full animate-ping animation-delay-500"></div>
                        </>
                      )}
                    </div>
                    <div className={`absolute -right-6 top-12 w-12 h-12 rounded-full transition-all duration-1000 ${
                      progress === 100 ? 'bg-gradient-to-br from-emerald-300 to-green-500 opacity-85 shadow-lg shadow-emerald-400/30 animate-branch-glow' :
                      progress >= 70 ? 'bg-gradient-to-br from-green-400 to-green-500 opacity-70' :
                      progress >= 40 ? 'bg-gradient-to-br from-yellow-400 to-green-400 opacity-50' :
                      'bg-white/10 opacity-30'
                    }`}>
                      {/* 100% branch sparkles */}
                      {progress === 100 && (
                        <>
                          <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-white rounded-full animate-ping animation-delay-700"></div>
                          <div className="absolute bottom-2 right-1 w-1 h-1 bg-emerald-200 rounded-full animate-ping animation-delay-200"></div>
                        </>
                      )}
                    </div>
                    
                    {/* 100% Completion Extra Branches */}
                    {progress === 100 && (
                      <>
                        <div className="absolute -left-10 top-4 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-200 to-green-400 opacity-70 shadow-md shadow-emerald-300/40 animate-extra-branch-1">
                          <div className="absolute top-1 right-1 w-0.5 h-0.5 bg-white rounded-full animate-ping"></div>
                        </div>
                        <div className="absolute -right-8 top-6 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-200 to-green-400 opacity-60 shadow-md shadow-emerald-300/30 animate-extra-branch-2">
                          <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-white rounded-full animate-ping animation-delay-400"></div>
                        </div>
                        <div className="absolute -left-4 top-16 w-4 h-4 rounded-full bg-gradient-to-br from-emerald-200 to-green-400 opacity-50 animate-extra-branch-3"></div>
                      </>
                    )}
                  </div>
                  
                  {/* Tree Trunk */}
                  <div className="relative">
                    {/* Main trunk */}
                    <div className={`w-8 h-24 rounded-lg shadow-lg relative overflow-hidden transition-all duration-1000 ${
                      progress === 100 ? 'bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 shadow-xl shadow-amber-600/40' : 'bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900'
                    }`}>
                      {/* Progress fill in trunk */}
                      <div 
                        className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 rounded-lg ${
                          progress === 100 ? 'bg-gradient-to-t from-emerald-400 via-green-400 to-emerald-300 shadow-inner shadow-emerald-500/50' : 'bg-gradient-to-t from-drift-orange via-drift-pink to-drift-mauve'
                        }`}
                        style={{ height: `${progress}%` }}
                      >
                        {/* 100% trunk glow effect */}
                        {progress === 100 && (
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-200/30 via-green-300/20 to-emerald-200/30 animate-trunk-glow"></div>
                        )}
                      </div>
                      
                      {/* Trunk texture lines */}
                      <div className="absolute inset-0 flex flex-col justify-around opacity-30">
                        <div className="h-px bg-amber-600"></div>
                        <div className="h-px bg-amber-600"></div>
                        <div className="h-px bg-amber-600"></div>
                      </div>
                      
                      {/* 100% completion trunk sparkles */}
                      {progress === 100 && (
                        <>
                          <div className="absolute top-4 left-1 w-0.5 h-0.5 bg-emerald-200 rounded-full animate-ping animation-delay-300"></div>
                          <div className="absolute top-12 right-1 w-0.5 h-0.5 bg-white rounded-full animate-ping animation-delay-800"></div>
                          <div className="absolute bottom-8 left-2 w-0.5 h-0.5 bg-emerald-200 rounded-full animate-ping animation-delay-1000"></div>
                        </>
                      )}
                    </div>
                    
                    {/* Small branches */}
                    <div className={`absolute -left-3 top-4 w-6 h-1 rounded-full transition-all duration-700 ${
                      progress >= 25 ? 'bg-amber-700' : 'bg-white/20'
                    } rotate-45`}></div>
                    <div className={`absolute -right-3 top-8 w-4 h-1 rounded-full transition-all duration-700 ${
                      progress >= 50 ? 'bg-amber-700' : 'bg-white/20'
                    } -rotate-45`}></div>
                    <div className={`absolute -left-2 top-12 w-3 h-1 rounded-full transition-all duration-700 ${
                      progress >= 75 ? 'bg-amber-700' : 'bg-white/20'
                    } rotate-30`}></div>
                  </div>
                  
                  {/* Tree Roots/Base */}
                  <div className="relative mt-2">
                    <div className="w-20 h-4 bg-gradient-to-b from-amber-900 to-amber-950 rounded-full opacity-60"></div>
                    {/* Root lines */}
                    <div className="absolute -left-2 -top-1 w-8 h-1 bg-amber-900 rounded-full opacity-40 rotate-12"></div>
                    <div className="absolute -right-2 -top-1 w-6 h-1 bg-amber-900 rounded-full opacity-40 -rotate-12"></div>
                  </div>
                  
                  {/* Floating leaves/particles */}
                  {progress === 100 ? (
                    <>
                      {/* 100% Celebration Particles */}
                      <div className="absolute -top-6 -left-12 w-3 h-3 bg-emerald-300 rounded-full animate-celebration-burst-1 opacity-80"></div>
                      <div className="absolute -top-8 right-10 w-2.5 h-2.5 bg-green-300 rounded-full animate-celebration-burst-2 opacity-90"></div>
                      <div className="absolute top-2 -right-14 w-2 h-2 bg-emerald-400 rounded-full animate-celebration-burst-3 opacity-75"></div>
                      <div className="absolute -top-4 left-12 w-1.5 h-1.5 bg-white rounded-full animate-celebration-burst-4 opacity-85"></div>
                      <div className="absolute top-6 -left-16 w-2 h-2 bg-green-200 rounded-full animate-celebration-burst-5 opacity-70"></div>
                      <div className="absolute -top-2 -right-8 w-1 h-1 bg-emerald-200 rounded-full animate-celebration-burst-6 opacity-80"></div>
                      
                      {/* Golden confetti */}
                      <div className="absolute -top-10 left-4 w-1 h-1 bg-yellow-300 rounded-full animate-confetti-1 opacity-90"></div>
                      <div className="absolute -top-12 right-6 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-confetti-2 opacity-85"></div>
                      <div className="absolute -top-8 -left-2 w-1 h-1 bg-yellow-200 rounded-full animate-confetti-3 opacity-80"></div>
                      
                      {/* Success aura */}
                      <div className="absolute -inset-8 rounded-full border border-emerald-300/30 animate-success-aura-1"></div>
                      <div className="absolute -inset-12 rounded-full border border-green-200/20 animate-success-aura-2"></div>
                    </>
                  ) : progress >= 60 && (
                    <>
                      <div className="absolute -top-4 -left-8 w-2 h-2 bg-green-400 rounded-full animate-float-leaf-1 opacity-70"></div>
                      <div className="absolute -top-2 right-8 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-float-leaf-2 opacity-60"></div>
                      <div className="absolute top-4 -right-10 w-1 h-1 bg-green-500 rounded-full animate-float-leaf-3 opacity-80"></div>
                    </>
                  )}
                </div>
                
                                 {/* Progress Text */}
                 <div className="text-center text-white mt-6">
                   <div className="mb-2">
                     <span className={`text-3xl font-bold ${
                       progress === 100 ? 'bg-gradient-to-r from-emerald-300 via-green-400 to-emerald-500 bg-clip-text text-transparent animate-pulse' : 'bg-gradient-to-r from-drift-orange via-drift-pink to-drift-mauve bg-clip-text text-transparent'
                     }`}>
                       {progress}%
                     </span>
                     {progress === 100 && (
                       <div className="mt-2">
                         <span className="text-xl mx-2 text-emerald-300 font-bold animate-pulse">COMPLETE!</span>
                       </div>
                     )}
                   </div>
                   <p className={`text-lg ${
                     progress === 100 ? 'text-emerald-200 font-semibold' : 'text-white/80'
                   }`}>
                     {completedTasks} of {totalTasks} tasks completed
                   </p>
                   <p className={`text-sm mt-1 ${
                     progress === 100 ? 'text-emerald-300 font-medium text-base' : 'text-white/60'
                   }`}>
                     {progress >= 100 ? 'Congratulations! Your goal is achieved and your tree has reached full bloom!' :
                      progress >= 80 ? 'Almost there! Your tree is flourishing!' :
                      progress >= 60 ? 'Great progress! Your tree is growing strong!' :
                      progress >= 40 ? 'Keep going! Your tree is taking shape!' :
                      progress >= 20 ? 'Good start! Your tree is sprouting!' :
                      'Plant the seed of success!'}
                   </p>
                   
                   {/* 100% Celebration Message */}
                                        {progress === 100 && (
                       <div className="mt-4 p-4 bg-emerald-500/20 backdrop-blur-sm rounded-lg border border-emerald-400/30">
                         <p className="text-emerald-200 font-medium">
                           Amazing work! You've successfully completed your journey. 
                           Your dedication has grown into something beautiful!
                         </p>
                       </div>
                     )}
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-white">
            <p className="text-xl">No schedule data available.</p>
          </div>
        )}

        {/* Save Goal Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md mx-4 text-center">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-300 via-green-400 to-emerald-600 shadow-2xl shadow-emerald-400/40 flex items-center justify-center">
                  <Target className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
                <p className="text-white/80">You've completed your goal "{goalName}"!</p>
              </div>
              
              <p className="text-white/70 mb-6">
                Would you like to save this achievement to your Achievement Archive?
                {uploadedImages.length > 0 && (
                  <span className="block text-sm text-emerald-300 mt-2">
                    📸 {uploadedImages.length} photo{uploadedImages.length > 1 ? 's' : ''} will be included
                  </span>
                )}
              </p>
              
              {saveError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                  <p className="text-red-200 text-sm">{saveError}</p>
                </div>
              )}
              
              <div className="flex space-x-4">
                <button
                  onClick={saveGoalWithImages}
                  className="flex-1 px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 rounded-lg font-medium transition-all duration-300 border border-emerald-400/30"
                >
                  Save Achievement
                </button>
                <button
                  onClick={skipSave}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg font-medium transition-all duration-300 border border-white/20"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Goal Saved Confirmation */}
        {saveSuccess && (
          <div className="fixed bottom-4 right-4 bg-emerald-500/20 backdrop-blur-md rounded-lg p-4 border border-emerald-400/30 text-emerald-200 z-50">
            <p className="font-medium">Achievement saved to your archive!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleGenerator;