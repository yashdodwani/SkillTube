import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="content-section">
      <div className="hero">
        <h1>Transform YouTube Videos into Interactive Courses</h1>
        <p>Use AI to automatically chunk videos, generate summaries, and create engaging quizzes for any skill level.</p>
      </div>

      <div className="grid grid-3">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 Smart Chunking</h3>
            <p className="card-subtitle">AI-powered content segmentation for optimal learning</p>
          </div>
          <p>Automatically break down long videos into digestible, logical segments with intelligent summaries.</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🧠 Adaptive Quizzes</h3>
            <p className="card-subtitle">Difficulty-based question generation</p>
          </div>
          <p>Create engaging quizzes tailored to different skill levels - easy, medium, or hard.</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚡ Fast Processing</h3>
            <p className="card-subtitle">Background processing for large videos</p>
          </div>
          <p>Process complete courses asynchronously with real-time progress tracking.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
