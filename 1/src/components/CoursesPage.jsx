import React from 'react';
import CourseCard from './CourseCard';
import { mockCourses } from '../mockData/courses';

function CoursesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Available Courses</h1>
        <p className="text-xl text-gray-600">
          Start learning and earn tokens for completing courses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}

export default CoursesPage;