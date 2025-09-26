import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import socket from '../utils/socket';

const StudentLobby = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [students, setStudents] = useState([]);
  const [hostName, setHostName] = useState('');
  const userInfo = JSON.parse(localStorage.getItem('user-info'));

  useEffect(() => {
    if (!userInfo || !roomId) return;

    // Join quiz room
    socket.emit('join_quiz_room', {
      roomId,
      userId: userInfo._id,
      role: 'student'
    });

    // Listen for room updates
    socket.on('room_update', ({ students, teacher, teacherName }) => {
      // Transform the students array to include index-based names
      const studentsWithNumbers = students.map((studentId, index) => ({
        id: studentId,
        displayName: `Student ${index + 1}`
      }));
      setStudents(studentsWithNumbers);
      if (teacherName) {
        setHostName(teacherName);
      }
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

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-4xl mx-auto p-8">
        {/* Host Information */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-8 mb-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-400">HOSTED BY</h2>
            <div className="text-3xl font-bold text-[#00FF9D]">
              {hostName || 'Loading...'}
            </div>
          </div>
        </Card>

        {/* Participants List */}
        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00FF9D]" />
              <h2 className="text-xl font-semibold">OTHER PARTICIPANTS</h2>
            </div>
            <span className="px-4 py-1 bg-[#00FF9D]/10 text-[#00FF9D] rounded-full text-sm">
              {students.length} Students
            </span>
          </div>

          <div className="space-y-4">
            {students.map((student) => (
              <div 
                key={student.id}
                className="p-4 rounded-lg border border-white/10 bg-black/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00FF9D]/10 flex items-center justify-center text-[#00FF9D]">
                    {student.displayName.split(' ')[1]}
                  </div>
                  <span className="text-gray-200">{student.displayName}</span>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Waiting for other students to join...
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentLobby; 