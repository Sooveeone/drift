import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import Schedule from "./components/ScheduleGenerator";
import OceanWavesPlayer from "./components/OceanWavesPlayer";

// Component to conditionally render music player
const ConditionalMusicPlayer: React.FC = () => {
  const location = useLocation();
  
  // Pages where music should NOT play
  const noMusicPages = ['/login', '/register'];
  
  // Don't show music player on login or register pages
  if (noMusicPages.includes(location.pathname)) {
    return null;
  }
  
  return <OceanWavesPlayer volume={0.2} />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ConditionalMusicPlayer />
    </Router>
  );
};

export default App;
