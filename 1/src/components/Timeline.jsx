import React from 'react';

function Timeline({ chunks, onChunkClick }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
      <div className="space-y-6">
        {chunks.map((chunk, index) => (
          <div
            key={index}
            className={`relative pl-10 cursor-pointer transition-colors ${
              chunk.isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => onChunkClick(index)}
          >
            <div
              className={`absolute left-3 top-1.5 w-3 h-3 rounded-full border-2 ${
                chunk.isActive
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white border-gray-400'
              }`}
            ></div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors">
              <p className="font-medium mb-1">{chunk.title}</p>
              <p className="text-sm text-gray-500">
                {Math.floor(chunk.end_time - chunk.start_time)} seconds
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Timeline;