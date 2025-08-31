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
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); onSectionChange('home'); }}>
            SkillVId
          </a>
          <nav className="nav">
            {navItems.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-link ${currentSection === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSectionChange(item.id);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
