import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Save, Edit, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import socket from '../utils/socket';

const QuestionCard = ({ question, index }) => {
  return (
    <div className="p-6 rounded-lg border border-white/10 bg-black/20 space-y-4">
      <div className="flex items-start gap-4">
        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#00FF9D]/10 text-[#00FF9D] font-medium">
          {index + 1}
        </span>
        <h3 className="text-lg text-white">{question.question}</h3>
      </div>
      
      <div className="ml-12 space-y-3">
        {question.options.map((option, idx) => (
          <div 
            key={idx}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              option === question.answer 
                ? 'border-[#00FF9D]/30 bg-[#00FF9D]/5' 
                : 'border-white/5 bg-black/20'
            }`}
          >
            {option === question.answer && (
              <Check className="w-5 h-5 text-[#00FF9D]" />
            )}
            <span className={option === question.answer ? 'text-[#00FF9D]' : 'text-gray-300'}>
              {option}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuizPreviewNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const quizData = location.state?.quizData;

  const handleShareQuiz = () => {
    const userInfo = JSON.parse(localStorage.getItem('user-info'));
    const teacherId = userInfo?._id;
    
    if (!teacherId || !quizData) return;
    
    // Generate unique room code
    const roomId = teacherId.slice(-4) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    // Store quiz data in Redis
    socket.emit('store_quiz', {
      roomId,
      quizData: quizData.quiz, // Note: YouTube quiz format might be different
      teacherId
    });

    // Navigate to quiz lobby
    navigate(`/quiz-lobby/${roomId}`);
  };

  if (!location.state) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-red-400">No quiz data found. Please generate a quiz first.</p>
          <button 
            onClick={() => navigate('/create-quiz')}
            className="text-[#00FF9D] hover:underline"
          >
            Return to Quiz Creator
          </button>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF9D]"></div>
          <p className="text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Editor
          </button>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 bg-white/5 border-white/10 hover:bg-white/10"
              onClick={() => navigate('/create-quiz')}
            >
              <Edit className="w-4 h-4" />
              Edit Quiz
            </Button>
            <Button 
              className="flex items-center gap-2 bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] hover:bg-[#00FF9D]/20"
              onClick={handleShareQuiz}
            >
              <Save className="w-4 h-4" />
              Share Quiz
            </Button>
          </div>
        </div>

        <Card className="bg-black/40 backdrop-blur-md border border-white/10">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-2xl font-bold">
              <span className="text-[#00FF9D]">{quizData.title}</span> Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {quizData.quiz.map((question, idx) => (
                <QuestionCard 
                  key={idx} 
                  question={question} 
                  index={idx} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizPreviewNew; 