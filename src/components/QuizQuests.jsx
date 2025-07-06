import React, { useState, useEffect } from 'react';
import { courseService } from '../services/api';
import useUserStore from '../store/userStore';
import useThemeStore from '../store/themeStore';

function QuizQuests() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const clearNewQuizzes = useUserStore((state) => state.clearNewQuizzes);
  const darkMode = useThemeStore((state) => state.darkMode);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // In a real app, you would fetch the user's quizzes here
        setLoading(false);
        clearNewQuizzes();
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [clearNewQuizzes]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Quiz & Quests
      </h1>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
          No active quizzes available.
        </p>
      </div>
    </div>
  );
}

export default QuizQuests;