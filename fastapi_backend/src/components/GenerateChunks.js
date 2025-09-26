import React, { useState } from 'react';
import { apiService } from '../services/api';
import './GenerateChunks.css';

function GenerateChunks({ onChunksGenerated, currentChunk }) {
  const [formData, setFormData] = useState({
    youtubeUrl: '',
    level: 'easy'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [chunks, setChunks] = useState([]);
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

    try {
      const chunks = await apiService.generateChunks(formData.youtubeUrl, formData.level);

      setChunks(chunks);
      onChunksGenerated(chunks[0]); // Set first chunk as current
    } catch (err) {
      setError(err.message || 'Failed to generate chunks');
    } finally {
      setIsLoading(false);
    }
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
          <h2 className="card-title">Generate Content Chunks</h2>
          <p className="card-subtitle">Break down YouTube videos into learning segments</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="youtubeUrl" className="form-label">YouTube URL</label>
            <input
              type="url"
              id="youtubeUrl"
              name="youtubeUrl"
              className="form-input"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.youtubeUrl}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="level" className="form-label">Difficulty Level</label>
            <select
              id="level"
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
                Generating...
              </>
            ) : (
              'Generate Chunks'
            )}
          </button>
        </form>

        {error && (
          <div className="status error mt-4">
            ❌ {error}
          </div>
        )}

        {chunks.length > 0 && (
          <div className="chunks-result mt-4">
            <h3 className="mb-4">Generated Chunks ({chunks.length})</h3>
            {chunks.map((chunk, index) => (
              <div key={index} className="chunk-item">
                <div className="chunk-title">{chunk.title || `Chunk ${index + 1}`}</div>
                <div className="chunk-time">
                  {formatTime(chunk.start_time)} - {formatTime(chunk.end_time)}
                </div>
                <div className="chunk-summary">{chunk.summary}</div>
                <div className="chunk-transcript">{chunk.transcript}</div>
                <button 
                  className="btn btn-secondary mt-4"
                  onClick={() => onChunksGenerated(chunk)}
                >
                  Use for Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GenerateChunks;
