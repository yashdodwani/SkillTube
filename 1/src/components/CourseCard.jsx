import React from 'react';
import { Link } from 'react-router-dom';
import useUserStore from '../store/userStore';

function CourseCard({ course }) {
  const isCompleted = useUserStore((state) => state.isCompleted(course.id));

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <img 
        src={course.thumbnail} 
        alt={course.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-3 py-1 rounded-full text-sm ${
            course.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            course.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
          </span>
          <span className="text-gray-500">{course.duration}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
        <div className="flex items-center justify-between mt-4">
          <Link 
            to={`/course/${course.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isCompleted ? 'Review Course' : 'Start Learning'}
          </Link>
          {isCompleted && (
            <div className="flex items-center text-green-600">
              <span className="mr-2">✓</span>
              Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;