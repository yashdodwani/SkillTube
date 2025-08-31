import React, { useState } from 'react';
import axios from 'axios';
import './CompleteCourse.css';

function CompleteCourse() {
  const [formData, setFormData] = useState({
    youtubeUrl: '',
    level: 'easy'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setProgress(null);
    setResult(null);

    try {
      const response = await axios.post('/api/course/process-complete', {
        youtube_url: formData.youtubeUrl,
        level: formData.level
      });

      if (response.data.status === 'initialized') {
        const newTaskId = 'task_' + Date.now();
        setTaskId(newTaskId);
        monitorProgress(newTaskId);
      } else {
        setError('Failed to initialize task');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process course');
      setIsLoading(false);
    }
  };

  const monitorProgress = async (taskId) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/course/status/${taskId}`);
        const status = response.data;
        
        setProgress(status);

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          setIsLoading(false);
          
          if (status.status === 'completed') {
            setResult(status.result);
          } else {
            setError(status.message);
          }
        }
      } catch (err) {
        console.error('Error monitoring progress:', err);
        clearInterval(interval);
        setIsLoading(false);
        setError('Failed to monitor progress');
      }
    }, 2000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="content-section">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Complete Course Generation</h2>
          <p className="card-subtitle">Process entire videos with chunks and quizzes</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="completeYoutubeUrl" className="form-label">YouTube URL</label>
            <input
              type="url"
              id="completeYoutubeUrl"
              name="youtubeUrl"
              className="form-input"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.youtubeUrl}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="completeLevel" className="form-label">Difficulty Level</label>
            <select
              id="completeLevel"
              name="level"
              className="form-select"
              value={formData.level}
              onChange={handleInputChange}
              required
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading"></span>
                Processing Course...
              </>
            ) : (
              'Process Complete Course'
            )}
          </button>
        </form>

        {error && (
          <div className="status error mt-4">
            ❌ {error}
          </div>
        )}

        {progress && (
          <div className="progress-section mt-4">
            <h3 className="mb-4">Processing Course...</h3>
            <div className={`status ${progress.status === 'processing' ? 'processing' : progress.status === 'completed' ? 'success' : 'error'}`}>
              {progress.status === 'processing' ? '⏳' : progress.status === 'completed' ? '✅' : '❌'} {progress.message}
            </div>
            <div className="progress">
              <div 
                className="progress-bar" 
                style={{ width: `${(progress.current_step / progress.total_steps) * 100}%` }}
              ></div>
            </div>
            <div className="text-center">
              Step {progress.current_step} of {progress.total_steps}
            </div>
          </div>
        )}

        {result && (
          <div className="result-section mt-4">
            <h3 className="mb-4">Course Generation Complete!</h3>
            <div className="status success">
              ✅ Course successfully generated with {result.length} chunks
            </div>
            <div className="mt-4">
              {result.map((item, index) => (
                <div key={index} className="chunk-item">
                  <h4>{item.chunk.title || `Chunk ${index + 1}`}</h4>
                  <p>{item.chunk.summary}</p>
                  <div className="mt-4">
                    <h5>Quiz Questions:</h5>
                    {item.questions.map((q, qIndex) => (
                      <div key={qIndex} className="quiz-item">
                        <div className="quiz-question">{q.question}</div>
                        <div className="quiz-options">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`quiz-option ${i === q.correct_answer ? 'correct' : ''}`}>
                              {String.fromCharCode(65 + i)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompleteCourse;
