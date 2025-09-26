import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from 'lucide-react';

const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scores, studentNames } = location.state || {};
  const [studentsWithNames, setStudentsWithNames] = useState({});
  
  useEffect(() => {
    // Get current user info from localStorage
    const currentUserInfo = JSON.parse(localStorage.getItem('user-info') || '{}');
    
    // Create a mapping of student IDs to names
    const studentNames = {};
    if (scores) {
      Object.keys(scores).forEach(id => {
        console.log(id);
        console.log(currentUserInfo._id);
        if (id === currentUserInfo._id) {
          // If this score belongs to the current user
          studentNames[id] = currentUserInfo.username || 'Unknown';
        } else {
          // For other students, use a generic name with their ID
          studentNames[id] = `Student ${id.slice(-4)}`;
        }
      });
    }
    
    setStudentsWithNames(studentNames);
  }, [scores]);

  const handleExportResults = () => {
    const csvContent = `Student ID,Name,Score\n${
      Object.entries(scores)
        .map(([id, score]) => `${id},${studentsWithNames[id] || 'Unknown'},${score}`)
        .join('\n')
    }`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz_results.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-4xl mx-auto p-8">
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Quiz Results</h1>
            <Button
              onClick={handleExportResults}
              className="bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Student Name</th>
                  <th className="text-left py-3 px-4">Score</th>
                  <th className="text-left py-3 px-4">Performance</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(scores || {}).map(([id, score]) => (
                  <tr key={id} className="border-b border-white/5">
                    <td className="py-4 px-4">{studentNames[id] || `Student ${id.slice(-4)}`}</td>
                    <td className="py-4 px-4">{score}</td>
                    <td className="py-4 px-4">
                      <span className={
                        score >= 7 ? 'text-green-400' :
                        score >= 5 ? 'text-yellow-400' :
                        'text-red-400'
                      }>
                        {score >= 7 ? 'Excellent' :
                         score >= 5 ? 'Good' :
                         'Needs Improvement'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            onClick={() => navigate('/teacher-dashboard')}
            className="mt-8 flex items-center gap-2 bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default QuizResults; 