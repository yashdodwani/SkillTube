import React from 'react';

const Dialog = ({ open, onClose, children, className = '' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative bg-[#111827] rounded-lg shadow-xl max-w-md w-full mx-4 p-6 ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default Dialog;