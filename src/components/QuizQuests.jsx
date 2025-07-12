import React, { useState, useEffect } from 'react';
import { courseService } from '../services/api';
import useUserStore from '../store/userStore';

function QuizQuests() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const clearNewQuizzes = useUserStore((state) => state.clearNewQuizzes);

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
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white transition-colors duration-200">
        Quiz & Quests
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
          No active quizzes available.
        </p>
      </div>
    </div>
  );
}

export default QuizQuests;