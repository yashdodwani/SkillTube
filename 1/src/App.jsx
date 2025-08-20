import React, { useEffect } from 'react';
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

  // Apply dark mode to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: darkMode ? '#374151' : '#ffffff',
                color: darkMode ? '#f9fafb' : '#111827',
                border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
              },
            }}
          />
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