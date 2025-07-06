import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CourseMaker from './components/CourseMaker';
import QuizQuests from './components/QuizQuests';
import QuizAnalytics from './components/QuizAnalytics';
import RewardSystem from './components/RewardSystem';
import CompletedCourses from './components/CompletedCourses';
import useThemeStore from './store/themeStore';

function App() {
  const darkMode = useThemeStore((state) => state.darkMode);

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <Router>
        <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
          <Toaster position="top-right" />
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/course-maker" element={<CourseMaker />} />
                <Route path="/quiz-quests" element={<QuizQuests />} />
                <Route path="/quiz-analytics" element={<QuizAnalytics />} />
                <Route path="/rewards" element={<RewardSystem />} />
                <Route path="/completed-courses" element={<CompletedCourses />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;