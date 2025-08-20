import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { courseService } from '../services/api';
import useUserStore from '../store/userStore';

function VideoProcessor() {
  const [url, setUrl] = useState('');
  const [level, setLevel] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const navigate = useNavigate();
  const incrementNewQuizzes = useUserStore((state) => state.incrementNewQuizzes);

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
    <div className="min-h-[80vh] flex items-center justify-center text-gray-900 dark:text-white transition-colors duration-200">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 transition-colors duration-200">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-200">
            Create Your Course
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 transition-colors duration-200">
            Transform any YouTube video into an interactive learning experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 transition-colors duration-200">
              YouTube Video URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 transition-colors duration-200">
              Difficulty Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Generating Course...' : 'Generate Course'}
          </button>
        </form>

        {progress && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">
              Progress: {progress.current_step}/{progress.total_steps}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
              {progress.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoProcessor;