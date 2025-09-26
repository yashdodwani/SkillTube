import React, { useState, useEffect } from 'react';
import CircularTimer from './CircularTimer';

const QuizDisplay = ({ quizData, onFinish }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(Array(quizData.quiz.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState(null);
  const [startTime] = useState(Date.now());

  // Validate quiz data structure
  useEffect(() => {
    if (!quizData || !Array.isArray(quizData.quiz)) {
      setError('Invalid quiz data format');
      return;
    }

    const invalidQuestions = quizData.quiz.some(
      q => !q.question || !Array.isArray(q.options) || !q.answer
    );

    if (invalidQuestions) {
      setError('Invalid question format in quiz data');
    }
  }, [quizData]);

  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
  }, [timeLeft]);

  useEffect(() => {
    setTimeLeft(60);
  }, [currentQuestion]);

  // Handle answer selection
  const handleAnswerSelect = (selectedOption) => {
    setSelectedAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = selectedOption;
      return newAnswers;
    });
  };

  // Handle moving to next question
  const handleNextQuestion = () => {
    if (selectedAnswers[currentQuestion] !== null) {
      if (currentQuestion < quizData.quiz.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        showQuizResults();
      }
    }
  };

  // Handle time up
  const handleTimeUp = () => {
    if (selectedAnswers[currentQuestion] === null) {
      setSelectedAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[currentQuestion] = "Not answered";
        return newAnswers;
      });
    }
    
    if (currentQuestion < quizData.quiz.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      showQuizResults();
    }
  };

  // Show final results
  const showQuizResults = () => {
    setShowResults(true);
  };

  // Calculate score
  const calculateScore = () => {
    return selectedAnswers.reduce((acc, answer, index) => {
      if (!answer || answer === "Not answered") return acc;
      return acc + (answer === quizData.quiz[index].answer ? 1 : 0);
    }, 0);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-red-500/30">
          <h2 className="text-2xl font-semibold text-center mb-4 text-red-400">Error Loading Quiz</h2>
          <p className="text-center text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => onFinish()}
            className="w-full bg-red-500/10 border border-red-500/30 text-red-400 font-medium py-3 px-4 rounded-xl hover:bg-red-500/20 transition-all duration-300"
          >
            Return to Quiz Generator
          </button>
        </div>
      </div>
    );
  }

  // Show completion state
  if (showResults) {
    const score = calculateScore();
    const timeSpent = formatTime(Math.floor((Date.now() - startTime) / 1000));
    
    return (
      <div className="min-h-screen bg-black text-white pt-24">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-12">
            <h2 className="text-6xl font-bold mb-4">
              YOUR SCORE: <span className="text-[#00FF9D]">{score}/{quizData.quiz.length}</span>
            </h2>
            <p className="text-2xl text-gray-400">
              Time utilised: {formatTime(Math.floor((Date.now() - startTime) / 1000))}
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 mb-4 text-xl font-bold">
              <div>Questions</div>
              <div>Your Answer</div>
              <div>Correct Answer</div>
            </div>
            
            {quizData.quiz.map((question, index) => {
              const userAnswer = selectedAnswers[index] || "Not answered";
              return (
                <div 
                  key={index}
                  className={`grid grid-cols-3 gap-4 p-4 rounded-lg ${
                    userAnswer === question.answer 
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}
                >
                  <div>{question.question}</div>
                  <div>{userAnswer}</div>
                  <div>{question.answer}</div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => onFinish(score, timeSpent, selectedAnswers)}
            className="mt-8 w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] font-medium py-3 px-4 rounded-xl hover:bg-[#00FF9D]/20 transition-all duration-300"
          >
            Back to Quiz Generator
          </button>
        </div>
      </div>
    );
  }

  // Ensure we have valid quiz data before rendering
  if (!quizData?.quiz?.[currentQuestion]) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF9D] mx-auto"></div>
        </div>
      </div>
    );
  }

  const currentQuiz = quizData.quiz[currentQuestion];

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-4xl mx-auto p-8">
        {/* Timer and Progress */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-xl">
            Question {currentQuestion + 1}/{quizData.quiz.length}
          </div>
          <CircularTimer 
            key={currentQuestion}
            duration={60} 
            onTimeUp={handleTimeUp}
          />
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{currentQuiz.question}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuiz.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                  selectedAnswers[currentQuestion] === option
                    ? 'border-[#00FF9D] bg-[#00FF9D]/10 text-[#00FF9D]'
                    : 'border-white/10 hover:border-[#00FF9D]/50 hover:bg-[#00FF9D]/5'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <button
          onClick={handleNextQuestion}
          disabled={!selectedAnswers[currentQuestion]}
          className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] font-medium py-3 px-4 rounded-xl hover:bg-[#00FF9D]/20 transition-all duration-300 disabled:opacity-50"
        >
          {currentQuestion === quizData.quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default QuizDisplay;