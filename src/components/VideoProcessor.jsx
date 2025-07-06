import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { courseService } from '../services/api';
import useUserStore from '../store/userStore';
import useThemeStore from '../store/themeStore';

function VideoProcessor() {
  const [url, setUrl] = useState('');
  const [level, setLevel] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const navigate = useNavigate();
  const incrementNewQuizzes = useUserStore((state) => state.incrementNewQuizzes);
  const darkMode = useThemeStore((state) => state.darkMode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await courseService.generateCourse(url, level);
      const taskId = response.task_id;
      
      // Start polling for status
      const statusInterval = setInterval(async () => {
        try {
          const statusResponse = await courseService.getCourseStatus(taskId);
          setProgress(statusResponse);

          if (statusResponse.status === 'completed') {
            clearInterval(statusInterval);
            setLoading(false);
            incrementNewQuizzes();
            toast.success('Course generated successfully!');
            navigate(`/quiz-quests`);
          } else if (statusResponse.status === 'failed') {
            clearInterval(statusInterval);
            setLoading(false);
            toast.error(statusResponse.message);
          }
        } catch (error) {
          clearInterval(statusInterval);
          setLoading(false);
          toast.error('Failed to check course status');
        }
      }, 2000);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.detail || 'Failed to generate course');
    }
  };

  return (
    <div className={`min-h-[80vh] flex items-center justify-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className={`max-w-2xl w-full ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-8`}>
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Create Your Course
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Transform any YouTube video into an interactive learning experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              YouTube Video URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'border-gray-300 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-500 transition-colors`}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Content Difficulty
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'border-gray-300 focus:border-blue-500'
              } focus:ring-2 focus:ring-blue-500 transition-colors`}
            >
              <option value="easy">Beginner Friendly</option>
              <option value="medium">Intermediate</option>
              <option value="hard">Advanced</option>
            </select>
          </div>

          {progress && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex justify-between mb-2">
                <span>{progress.message}</span>
                <span>{Math.round((progress.current_step / progress.total_steps) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(progress.current_step / progress.total_steps) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg text-white text-lg font-medium transition-colors ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Processing Video...
              </div>
            ) : (
              'Generate Course'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VideoProcessor;