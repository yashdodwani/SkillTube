import React, { useState } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import GenerateChunks from './components/GenerateChunks';
import CreateQuiz from './components/CreateQuiz';
import CompleteCourse from './components/CompleteCourse';
import './App.css';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [currentChunk, setCurrentChunk] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);

  const renderSection = () => {
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
