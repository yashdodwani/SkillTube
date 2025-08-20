import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Star, Send } from 'lucide-react';

const MatchedTeachers = () => {
  const navigate = useNavigate();
  const { doubtId } = useParams();
  const location = useLocation();
  const matchedData = location.state?.matchedData;

  // If no matched data, redirect back
  if (!matchedData) {
    navigate('/doubt/create');
    return null;
  }

  const { assignedTeacher, onlineteacher } = matchedData;

  const handleJoinChat = () => {
    navigate(`/doubt/${doubtId}/chat`);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-8">
          {/* Subject Detection Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-[#00FF9D] mb-2">
              AI Detected Subject of Your Doubt
            </h2>
            <p className="text-lg text-gray-400">
              {onlineteacher[0]?.field} {onlineteacher[0]?.subcategory && `› ${onlineteacher[0].subcategory}`}
            </p>
          </div>

          {/* Available Teachers Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Available Teachers For You!</h3>
              <span className="px-4 py-1 bg-[#00FF9D]/10 text-[#00FF9D] rounded-full border border-[#00FF9D]/30">
                ONLINE
              </span>
            </div>

            {/* Teachers List */}
            <div className="space-y-4">
              {onlineteacher?.map((teacher) => (
                <div 
                  key={teacher._id}
                  className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-black/20 hover:border-[#00FF9D]/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#00FF9D]/20 flex items-center justify-center">
                      {teacher.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium">{teacher.username}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Star className="w-4 h-4 text-[#00FF9D]" />
                        <span>{teacher.rating}/5</span>
                        <span>•</span>
                        <span>{teacher.doubtsSolved} doubts solved</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleJoinChat}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00FF9D]/10 text-[#00FF9D] rounded-lg border border-[#00FF9D]/30 hover:bg-[#00FF9D]/20 transition-all duration-300"
                  >
                    <Send className="w-4 h-4" />
                    <span>Chat</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchedTeachers; 