import React, { useState } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import GenerateChunks from './components/GenerateChunks';
import CreateQuiz from './components/CreateQuiz';
import CompleteCourse from './components/CompleteCourse';
import { apiService } from './services/api';
import './App.css';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [currentChunk, setCurrentChunk] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(null);

  // Check backend connection on component mount
  React.useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        await apiService.healthCheck();
        setIsBackendConnected(true);
      } catch (error) {
        console.error('Backend connection failed:', error);
        setIsBackendConnected(false);
      }
    };

    checkBackendConnection();
  }, []);

  const renderSection = () => {
    // Show connection status if backend is not connected
    if (isBackendConnected === false) {
      return (
        <div className="content-section">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Backend Connection Error</h2>
              <p className="card-subtitle">Unable to connect to the backend server</p>
            </div>
            <div className="status error">
              ❌ Please make sure the Python backend is running on http://localhost:8000
            </div>
            <div className="mt-4">
              <p>To start the backend server, run:</p>
              <pre style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius)', marginTop: '0.5rem' }}>
                python main.py
              </pre>
            </div>
          </div>
        </div>
      );
    }

    // Show loading while checking connection
    if (isBackendConnected === null) {
      return (
        <div className="content-section">
          <div className="card">
            <div className="text-center">
              <span className="loading"></span>
              <p className="mt-4">Connecting to backend...</p>
            </div>
          </div>
        </div>
      );
    }

    switch (currentSection) {
      case 'home':
        return <Home />;
      case 'chunks':
        return <GenerateChunks 
          onChunksGenerated={setCurrentChunk}
          currentChunk={currentChunk}
        />;
      case 'quiz':
        return <CreateQuiz 
          currentChunk={currentChunk}
          onQuizGenerated={setCurrentQuiz}
          currentQuiz={currentQuiz}
        />;
      case 'complete':
        return <CompleteCourse />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="App">
      <Header 
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />
      <main className="main">
        <div className="container">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

export default App;
