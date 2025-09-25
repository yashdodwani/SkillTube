import React, { useState } from 'react';
import { apiService } from '../services/api';
import './CreateQuiz.css';

function CreateQuiz({ currentChunk, onQuizGenerated, currentQuiz }) {
  const [level, setLevel] = useState('easy');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!currentChunk) {
      setError('Please generate chunks first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const questions = await apiService.generateQuiz(currentChunk, level);

      setQuestions(questions);
      onQuizGenerated(questions);
      setSelectedAnswers({});
      setShowAnswers(false);
    } catch (err) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleCheckAnswers = () => {
    setShowAnswers(true);
  };

  const getOptionClass = (questionIndex, optionIndex, correctAnswer) => {
    if (!showAnswers) {
      return selectedAnswers[questionIndex] === optionIndex ? 'selected' : '';
    }
    
    if (optionIndex === correctAnswer) {
      return 'correct';
    }
    
    if (selectedAnswers[questionIndex] === optionIndex && optionIndex !== correctAnswer) {
      return 'incorrect';
    }
    
    return '';
  };

  if (!currentChunk) {
    return (
      <div className="content-section">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Create Quiz Questions</h2>
            <p className="card-subtitle">Generate interactive quizzes from video chunks</p>
          </div>
          <div className="status warning">
            ⚠️ Please generate chunks first to create a quiz
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-section">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Create Quiz Questions</h2>
          <p className="card-subtitle">Generate interactive quizzes from video chunks</p>
        </div>

        <div className="quiz-form">
          <div className="form-group">
            <label htmlFor="quizLevel" className="form-label">Quiz Difficulty</label>
            <select
              id="quizLevel"
              className="form-select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleGenerateQuiz}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                Generating Quiz...
              </>
            ) : (
              'Generate Quiz'
            )}
          </button>
        </div>

        {error && (
          <div className="status error mt-4">
            ❌ {error}
          </div>
        )}

        {questions.length > 0 && (
          <div className="quiz-result mt-4">
            <h3 className="mb-4">Generated Quiz ({questions.length} questions)</h3>
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="quiz-item">
                <div className="quiz-question">
                  {qIndex + 1}. {question.question}
                </div>
                <div className="quiz-options">
                  {question.options.map((option, oIndex) => (
                    <div
                      key={oIndex}
                      className={`quiz-option ${getOptionClass(qIndex, oIndex, question.correct_answer)}`}
                      onClick={() => handleAnswerSelect(qIndex, oIndex)}
                    >
                      {String.fromCharCode(65 + oIndex)}. {option}
                    </div>
                  ))}
                </div>
                {showAnswers && (
                  <div className="quiz-explanation">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            ))}
            <div className="quiz-actions mt-4">
              <button 
                className="btn btn-primary"
                onClick={handleCheckAnswers}
                disabled={Object.keys(selectedAnswers).length === 0}
              >
                Check Answers
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateQuiz;
