import React from 'react';

const Tabs = ({ children, value, onChange }) => {
  return <div className="w-full">{children}</div>;
};

const TabsList = ({ children }) => {
  return (
    <div className="flex rounded-lg bg-[#1a2234] p-1 mb-4">
      {children}
    </div>
  );
};

const TabTrigger = ({ value, selected, onClick, children }) => {
  return (
    <button
      onClick={() => onClick(value)}
      className={`flex-1 px-4 py-2 rounded-md transition-all ${
        selected 
          ? 'bg-[#00FF9D]/20 border border-[#00FF9D]/50 text-[#00FF9D]' 
          : 'text-gray-400 hover:text-[#00FF9D]'
      }`}
    >
      {children}
    </button>
  );
};

const TabContent = ({ value, selected, children }) => {
  if (!selected) return null;
  return <div>{children}</div>;
};

export { Tabs, TabsList, TabTrigger, TabContent };