import React from 'react';
import useUserStore from '../store/userStore';

function Dashboard() {
  const completedCourses = useUserStore((state) => state.completedCourses);
  const tokens = useUserStore((state) => state.tokens);

  const stats = [
    {
      title: "Active Courses",
      value: "3",
      icon: (
        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: "Completed Courses",
      value: completedCourses.length,
      icon: (
        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Total Tokens",
      value: tokens,
      icon: (
        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white transition-colors duration-200">
          Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-colors duration-200">
                  {stat.icon}
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                  {stat.value}
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 transition-colors duration-200">
                {stat.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;