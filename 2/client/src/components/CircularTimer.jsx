import React, { useEffect, useState } from 'react';

const CircularTimer = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const circumference = 2 * Math.PI * 45; // radius = 45

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const strokeDashoffset = ((duration - timeLeft) / duration) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle
          cx="48"
          cy="48"
          r="45"
          stroke="rgba(0, 255, 157, 0.2)"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx="48"
          cy="48"
          r="45"
          stroke="#00FF9D"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-[#00FF9D]">
        {timeLeft}
      </div>
    </div>
  );
};

export default CircularTimer;
