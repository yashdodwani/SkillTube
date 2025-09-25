import React from 'react';
import './Header.css';

function Header({ currentSection, onSectionChange }) {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'chunks', label: 'Generate Chunks' },
    { id: 'quiz', label: 'Create Quiz' },
    { id: 'complete', label: 'Complete Course' }
  ];

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <button 
            className="logo" 
            onClick={() => onSectionChange('home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            SkillVId
          </button>
          <nav className="nav">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-link ${currentSection === item.id ? 'active' : ''}`}
                onClick={() => onSectionChange(item.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
