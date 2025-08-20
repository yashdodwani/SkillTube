import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Users } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useParams } from 'react-router-dom';
import socket from '../utils/socket';

const QuizLobby = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [students, setStudents] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('user-info'));

  useEffect(() => {
    if (!userInfo || !roomId) return;

    const role = userInfo.role;
    setIsTeacher(role === 'teacher');

    // Join quiz room
    socket.emit('join_quiz_room', {
      roomId,
      userId: userInfo._id,
      role,
    });

    // Listen for room updates
    socket.on('room_update', ({ students, teacher }) => {
      setStudents(students);
    });

    // Listen for quiz start
    socket.on('quiz_questions', (questions) => {
      navigate(`/quiz-session/${roomId}`, { state: { questions } });
    });

    return () => {
      socket.off('room_update');
      socket.off('quiz_questions');
    };
  }, [roomId, userInfo]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setIsCopied(true);
      toast({
        title: "Code Copied!",
        description: "Quiz code has been copied to clipboard",
        variant: "default",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleStartQuiz = () => {
    if (!roomId) return;
    
    // Emit start_quiz event with room ID and teacher ID
    socket.emit('start_quiz', { 
      roomId,
      teacherId: userInfo._id 
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-4xl mx-auto p-8">
        {/* Unique Code Display */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8 mb-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-400">UNIQUE CODE</h2>
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl font-bold text-[#00FF9D] tracking-wider">
                {roomId}
              </span>
              <button
                onClick={copyToClipboard}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  isCopied 
                    ? 'bg-[#00FF9D]/20 text-[#00FF9D]' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>

        {/* Students List */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00FF9D]" />
              <h2 className="text-xl font-semibold">STUDENTS JOINED</h2>
            </div>
            <span className="px-4 py-1 bg-[#00FF9D]/10 text-[#00FF9D] rounded-full text-sm">
              {students.length} Students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400">SNO</th>
                  <th className="text-left py-3 px-4 text-gray-400">STUDENT NAME</th>
                  <th className="text-left py-3 px-4 text-gray-400">
                    MARKS
                    <span className="text-sm ml-2 text-gray-500">(initial = 0 all)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} className="border-b border-white/5">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4">0</td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">
                      Waiting for students to join...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Start Quiz Button */}
        <Button
          onClick={handleStartQuiz}
          disabled={students.length === 0}
          className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] hover:bg-[#00FF9D]/20 h-12 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          START QUIZ
        </Button>
      </div>
    </div>
  );
};

export default QuizLobby; 