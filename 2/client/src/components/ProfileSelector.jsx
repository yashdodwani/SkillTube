import React from 'react';
import { UserCircle, Plus } from 'lucide-react';

const ProfileSelector = ({ onSelectProfile }) => {
  const profiles = [
    { id: 'student 1', name: 'Student', color: 'bg-blue-600' },
    { id: 'teacher', name: 'Teacher', color: 'bg-blue-600' },
    { id: 'student 2', name: 'Student ', color: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="grid grid-cols-2 gap-8 p-8">
        {profiles.map(profile => (
          <div key={profile.id} className="flex flex-col items-center gap-2">
            <button 
              onClick={() => onSelectProfile(profile.id)}
              className={`w-24 h-24 rounded-full ${profile.color} relative group transition-transform hover:scale-105`}
            >
              <div className="absolute inset-1 rounded-full bg-black -z-10 transform -rotate-6"></div>
              <UserCircle className="w-12 h-12 text-white mx-auto mt-6" />
            </button>
            <span className="text-white text-lg">{profile.name}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2">
          <button 
            className="w-24 h-24 rounded-full bg-gray-800 relative group transition-transform hover:scale-105"
          >
            <Plus className="w-12 h-12 text-white mx-auto mt-6" />
          </button>
          <span className="text-white text-lg">Add</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelector;