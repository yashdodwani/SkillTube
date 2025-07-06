import React from 'react';
import useUserStore from '../store/userStore';

function CompletedCourses() {
  const completedCourses = useUserStore((state) => state.completedCourses);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Completed Courses</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {completedCourses.length === 0 ? (
          <p className="text-gray-600">No completed courses yet.</p>
        ) : (
          <div className="space-y-4">
            {completedCourses.map((courseId) => (
              <div key={courseId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Course {courseId}</h3>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700">
                  View Certificate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompletedCourses;