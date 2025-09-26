import React from 'react';
import { Card } from '@/components/ui/card';

const FlashCard = ({ title, content }) => {
  return (
    <Card className="h-[400px] w-full bg-[#0C1F17] border border-white/10 shadow-2xl rounded-xl text-white overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
      <div className="h-full flex flex-col">
        {/* Header - Fixed at top */}
        <div className="p-6 pb-3 bg-[#0C1F17] border-b border-white/5">
          <span className="text-emerald-400 font-bold uppercase tracking-wider text-lg">
            {title}
          </span>
        </div>

        {/* Content - Scrollable area */}
        <div className="flex-1 p-6 pt-4 overflow-y-auto custom-scrollbar">
          <p className="text-white/90 text-base leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default FlashCard;