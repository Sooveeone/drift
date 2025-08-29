"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { BarChart3, Calendar, ChevronLeft, ChevronRight, Edit3, Home, LogOut, Menu, Target, Trophy, User, X } from "lucide-react"
import DriftLogo from "../../assets/drift_logo.svg"
import MakeItHappenFloat from "../../assets/makeithappen_float.svg"
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom"

import Goals from "./Goals"
import SchedulesPage from "./SchedulesPage"
import ManualSchedule from "./ManualSchedule"
import AchievementArchive from "./AchievementArchive"
import InfoPage from "./InfoPage";

// Simple FloatingBoat component
const FloatingBoat = () => {
  return (
    <div className="relative flex flex-col items-center">
      {/* Wind effects */}
      <div className="absolute z-10 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-1/4 w-16 h-[1px] bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-windGust1"></div>
        <div className="absolute right-5 top-1/3 w-12 h-[1px] bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-windGust2"></div>
        <div className="absolute left-10 top-2/3 w-14 h-[1px] bg-gradient-to-r from-white/0 via-white/25 to-white/0 animate-windGust3"></div>
      </div>
      
      {/* Boat with wind-drift animation */}
      <div className="relative animate-windDrift">
        <img src={DriftLogo || "/placeholder.svg"} alt="Drift logo" className="h-40 w-40" />
      </div>
      
      {/* Natural water with curved edges - moved closer to boat */}
      <div className="w-full -mt-4 overflow-visible">
        {/* Organic water surface with irregular edges */}
        <div className="relative h-3 overflow-visible">
          {/* Main water curve - reduced height */}
          <div className="absolute left-1/2 -translate-x-1/2 w-48 h-3 overflow-hidden">
            <div className="w-48 h-6 rounded-[100%] bg-gradient-to-b from-white/10 to-transparent"></div>
          </div>
          
          {/* Irregular ripple effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-52">
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-[100%] animate-ripple transform-gpu"></div>
          </div>
          
          {/* Smaller natural waves */}
          <div className="absolute top-1 left-[40%] w-16 h-[1px]">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-tinyWave1"></div>
          </div>
          <div className="absolute top-1 right-[42%] w-14 h-[1px]">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-full animate-tinyWave2"></div>
          </div>
          
          {/* Small glistening highlights */}
          <div className="absolute top-0 left-[30%] w-1 h-1 bg-white/40 rounded-full animate-glisten1"></div>
          <div className="absolute top-1 right-[35%] w-[2px] h-[2px] bg-white/50 rounded-full animate-glisten2"></div>
        </div>
        
        {/* Boat reflection with natural water distortion - moved up */}
        <div className="relative flex justify-center -mt-2">
          {/* The reflection itself */}
          <div className="animate-reflectionWind">
            <img 
              src={DriftLogo || "/placeholder.svg"} 
              alt="Reflection" 
              className="h-40 w-40 scale-y-[-1] opacity-40 blur-[1px]" 
            />
          </div>
          
          {/* Water movement lines */}
          <div className="absolute inset-0 flex flex-col justify-around pointer-events-none">
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-full animate-waveSlowA"></div>
            <div className="h-[1px] w-3/4 mx-auto bg-gradient-to-r from-white/10 via-transparent to-white/10 rounded-full animate-waveSlowB"></div>
            <div className="h-[1px] w-4/5 ml-auto bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full animate-waveFast"></div>
            <div className="h-[1px] w-2/3 mr-auto bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-full animate-waveMed"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Magical Make It Happen Button component
interface MagicalButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
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

interface GoalFormData {
  objective: string;
  deadline: string;
  dedication: string;
  goalName: string;
  category: string;
}

const Dashboard = () => {
  const [username, setUsername] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [formData, setFormData] = useState<GoalFormData>({
    objective: "",
    deadline: "",
    dedication: "",
    goalName: "",
    category: "",
  })
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem("userToken")
    const name = localStorage.getItem("userName")
    if (!token) {
      navigate("/login")
      return
    }
    setUsername(name || "User")
    const savedSidebarState = localStorage.getItem("sidebarCollapsed")
    if (savedSidebarState) setSidebarCollapsed(savedSidebarState === "true")
    else setSidebarCollapsed(window.innerWidth < 768)

    const handleResize = () => {
      if (window.innerWidth < 768) setMobileMenuOpen(false)
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (profileDropdownOpen && !target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false)
      }
    }
    
    window.addEventListener("resize", handleResize)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [navigate, profileDropdownOpen])

  const handleLogout = () => {
    localStorage.removeItem("userToken")
    localStorage.removeItem("userName")
    navigate("/login")
  }

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))
  }

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.goalName || !formData.objective || !formData.deadline || !formData.dedication) {
      return // Don't submit if missing required fields
    }

    // Store form data in localStorage temporarily for the schedule generation page
    localStorage.setItem("goalData", JSON.stringify(formData))

    // Show success message
    setShowSuccessMessage(true)

    // Navigate to schedule page (will generate AI schedule and save it)
    navigate("/schedule")
    
    // Note: User can navigate to schedules manually when ready, no forced redirect
  }

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Schedules", icon: Calendar, path: "/dashboard/schedules" },
    { name: "Manual Schedule", icon: Edit3, path: "/dashboard/manual" },
    { name: "Achievement Archive", icon: Trophy, path: "/dashboard/achievements" },
    { name: "Info", icon: BarChart3, path: "/dashboard/info" },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-b from-drift-orange via-drift-pink to-drift-blue">
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex flex-col bg-drift-blue transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div
          className={`flex h-16 items-center ${
            sidebarCollapsed ? "justify-center" : "justify-between"
          } border-b border-drift-purple/30 px-4`}
        >
          <div className="flex items-center space-x-3">
            <img src={DriftLogo || "/placeholder.svg"} alt="Drift logo" className="h-12 w-12" />
            {!sidebarCollapsed && <span className="text-xl font-bold text-white">Drift</span>}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white hover:bg-drift-purple/30 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-drift-orange text-white shadow-md hover:bg-drift-pink transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                location.pathname === item.path
                  ? "bg-drift-purple text-white"
                  : "text-white/80 hover:bg-drift-purple/40 hover:text-white"
              } ${sidebarCollapsed ? "justify-center" : ""}`}
            >
              <item.icon className={`h-5 w-5 ${sidebarCollapsed ? "" : "mr-3"}`} />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
        <div className={`border-t border-drift-purple/30 p-4 ${sidebarCollapsed ? "flex justify-center" : ""}`}>
          {sidebarCollapsed ? (
            <div className="relative profile-dropdown">
              <button
                onClick={toggleProfileDropdown}
                className="h-10 w-10 cursor-pointer rounded-full bg-drift-mauve flex items-center justify-center text-white font-medium shadow-md hover:bg-drift-mauve/80 transition-colors"
              >
                {username.charAt(0).toUpperCase()}
              </button>
              {profileDropdownOpen && (
                <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded-md bg-drift-purple px-3 py-2 text-xs text-white shadow-lg border border-white/20 min-w-[120px]">
                  <p className="mb-2 text-center">{username}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center text-xs text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="mr-1 h-3 w-3" /> Logout
                  </button>
                </div>
              )}c
            </div>
          ) : (
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-drift-mauve flex items-center justify-center text-white font-medium shadow-md">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{username}</p>
                <button
                  onClick={handleLogout}
                  className="mt-1 flex items-center text-xs text-gray-300 hover:text-white"
                >
                  <LogOut className="mr-1 h-3 w-3" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
      <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <header className="sticky top-0 z-10 bg-transparent">
          <div className="flex h-12 items-center px-4 md:px-6">
            <button onClick={toggleMobileMenu} className="rounded-md p-2 text-white hover:bg-white/10 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-0 md:pt-2">
          <Routes>
            <Route
              path="/"
              element={
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center min-h-[80vh]">
                  <div className="w-full md:w-1/2 p-6 pt-2">
                    <div className="space-y-8 text-white">
                      <div className="space-y-5">
                        <h2 className="text-3xl font-bold">1. Give your goal a name</h2>
                        <input
                          type="text"
                          name="goalName"
                          value={formData.goalName}
                          onChange={handleChange}
                          placeholder="e.g., Learn Guitar Mastery, Fitness Journey, etc."
                          className="w-full px-5 py-4 rounded-md bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                        />
                      </div>

                      <div className="space-y-5">
                        <h2 className="text-3xl font-bold">2. What do you want to achieve?</h2>
                        <textarea
                          name="objective"
                          value={formData.objective}
                          onChange={handleChange}
                          placeholder="Describe your goal in detail..."
                          rows={3}
                          className="w-full px-5 py-4 rounded-md bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                        />
                      </div>

                      <div className="space-y-5">
                        <h2 className="text-2xl font-medium">3. What type of goal is this?</h2>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-5 py-4 rounded-md bg-white/20 backdrop-blur-sm text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg
                                  appearance-none cursor-pointer
                                  [&>option]:bg-drift-blue [&>option]:text-white [&>option]:py-2
                                  hover:bg-white/30 transition-colors duration-200"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 1rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em'
                          }}
                        >
                          <option value="" className="bg-drift-blue text-white/70">Select a category</option>
                          <option value="fitness" className="bg-drift-blue text-white">Fitness</option>
                          <option value="study" className="bg-drift-blue text-white">Study</option>
                          <option value="work" className="bg-drift-blue text-white">Work</option>
                        </select>
                      </div>

                      <div className="space-y-5">
                        <h2 className="text-2xl font-medium">4. When do you want to achieve this by?</h2>
                        <input
                          type="date"
                          id="deadline"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                          onKeyDown={(e) => e.preventDefault()}
                          className="w-full px-6 py-5 rounded-md bg-white/20 backdrop-blur-sm text-white 
                                    focus:outline-none focus:ring-2 focus:ring-white/50 
                                    border border-white/30 hover:bg-white/30 transition-colors text-lg
                                    cursor-pointer
                                    [&::-webkit-calendar-picker-indicator]:bg-white 
                                    [&::-webkit-calendar-picker-indicator]:p-0
                                    [&::-webkit-calendar-picker-indicator]:filter 
                                    [&::-webkit-calendar-picker-indicator]:invert
                                    [&::-webkit-calendar-picker-indicator]:hover:cursor-pointer
                                    [&::-webkit-datetime-edit-year-field]:text-white
                                    [&::-webkit-datetime-edit-month-field]:text-white
                                    [&::-webkit-datetime-edit-day-field]:text-white
                                    [&::-webkit-datetime-edit-text]:text-white
                                    [&::-webkit-calendar-picker]:scale-1000
                                    [&::-webkit-calendar-picker]:transform
                                    [&::-webkit-calendar-picker]:origin-top-left"
                        />
                      </div>

                      <div className="space-y-5">
                        <h2 className="text-2xl font-medium">5. How dedicated are you?</h2>
                        <select
                          id="dedication"
                          name="dedication"
                          value={formData.dedication}
                          onChange={handleChange}
                          className="w-full px-5 py-4 rounded-md bg-white/20 backdrop-blur-sm text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg
                                   appearance-none cursor-pointer
                                   [&>option]:bg-drift-blue [&>option]:text-white [&>option]:py-2
                                   hover:bg-white/30 transition-colors duration-200"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 1rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em'
                          }}
                        >
                          <option value="" className="bg-drift-blue text-white/70">Select your dedication level</option>
                          <option value="casual" className="bg-drift-blue text-white">Casual - I can spare a few hours per week</option>
                          <option value="moderate" className="bg-drift-blue text-white">Moderate - I can work on this regularly</option>
                          <option value="intense" className="bg-drift-blue text-white">Intense - I'm fully committed to this goal</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative py-8">
                    <div className="mb-10">
                      <FloatingBoat />
                    </div>

                    <MagicalButton
                      onClick={handleSubmit}
                      disabled={
                        !formData.goalName || !formData.objective || !formData.deadline || !formData.dedication
                      }
                    />
                  </div>
                </div>
              }
            />
            <Route path="goals" element={<Goals sidebarCollapsed={sidebarCollapsed} />} />
            <Route path="schedules" element={<SchedulesPage sidebarCollapsed={sidebarCollapsed} />} />
            <Route path="manual" element={<ManualSchedule sidebarCollapsed={sidebarCollapsed} />} />
            <Route path="achievements" element={<AchievementArchive sidebarCollapsed={sidebarCollapsed} />} />
            <Route path="info" element={<InfoPage />} />
          </Routes>
        </main>
      </div>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden" onClick={toggleMobileMenu}></div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-emerald-500/20 backdrop-blur-md rounded-lg p-4 border border-emerald-400/30 text-emerald-200 z-50 animate-pulse">
          <p className="font-medium">✅ Schedule saved to Schedules!</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
