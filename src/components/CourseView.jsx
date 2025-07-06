import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactPlayer from 'react-player';
import Timeline from './Timeline';

function CourseView() {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/course/status/${id}`);
        if (response.data.status === 'completed') {
          setCourseData(response.data.result);
        }
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load course data');
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-700">No course data found</h2>
      </div>
    );
  }

  const currentChunk = courseData[currentChunkIndex];
  const videoId = currentChunk.chunk.youtube_url?.split('v=')[1] || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Video Player */}
            <div className="aspect-w-16 aspect-h-9">
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${videoId}`}
                width="100%"
                height="100%"
                controls
                playing
                config={{
                  youtube: {
                    playerVars: {
                      start: Math.floor(currentChunk.chunk.start_time),
                      end: Math.floor(currentChunk.chunk.end_time)
                    }
                  }
                }}
              />
            </div>

            {/* Content Section */}
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {currentChunk.chunk.title}
              </h1>
              <div className="prose max-w-none">
                <p className="text-gray-600">{currentChunk.chunk.summary}</p>
              </div>
            </div>

            {/* Quiz Section */}
            <div className="p-6 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Knowledge Check</h2>
              <div className="space-y-6">
                {currentChunk.questions.map((question, index) => (
                  <div
                    key={index}
                    className={`bg-white rounded-lg p-6 shadow-sm border ${
                      selectedQuestionIndex === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <p className="text-lg font-medium text-gray-900 mb-4">
                      {index + 1}. {question.question}
                    </p>
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <button
                          key={optionIndex}
                          onClick={() => {
                            setSelectedQuestionIndex(index);
                            setShowAnswer(true);
                          }}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            showAnswer && selectedQuestionIndex === index
                              ? optionIndex === question.correct_answer
                                ? 'bg-green-50 border-green-500 text-green-700'
                                : 'bg-gray-50 border-gray-300 text-gray-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {showAnswer && selectedQuestionIndex === index && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-700">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Timeline</h2>
            <Timeline
              chunks={courseData.map(item => ({
                ...item.chunk,
                isActive: courseData.indexOf(item) === currentChunkIndex
              }))}
              onChunkClick={setCurrentChunkIndex}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => {
            setCurrentChunkIndex(prev => Math.max(0, prev - 1));
            setSelectedQuestionIndex(null);
            setShowAnswer(false);
          }}
          disabled={currentChunkIndex === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Previous Lesson
        </button>
        <button
          onClick={() => {
            setCurrentChunkIndex(prev => Math.min(courseData.length - 1, prev + 1));
            setSelectedQuestionIndex(null);
            setShowAnswer(false);
          }}
          disabled={currentChunkIndex === courseData.length - 1}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Next Lesson
        </button>
      </div>
    </div>
  );
}

export default CourseView;