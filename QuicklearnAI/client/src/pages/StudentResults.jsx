import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const StudentResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total } = location.state || {};
  const percentage = Math.round((score / total) * 100);

  if (!location.state) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <p className="text-red-400">No results data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-4xl mx-auto p-8">
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8">
          <div className="text-center space-y-8">
            <h1 className="text-4xl font-bold">Quiz Results</h1>
            
            <div className="text-6xl font-bold">
              <span className="text-[#00FF9D]">{score}</span>
              <span className="text-gray-400">/{total}</span>
            </div>
            
            <div className="text-2xl">
              <span className={percentage >= 70 ? 'text-[#00FF9D]' : 'text-red-400'}>
                {percentage}%
              </span>
            </div>

            <div className="text-gray-400">
              {percentage >= 70 ? 'Great job!' : 'Keep practicing!'}
            </div>

            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D]"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentResults; 