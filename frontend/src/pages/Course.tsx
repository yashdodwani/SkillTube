import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, Clock, BookOpen, Brain, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Progress from '../components/ui/Progress';
import { courseAPI } from '../services/api';
import { ProcessingStatus, CourseData, QuizQuestion } from '../types/api';
import { useToast } from '../components/ui/Toaster';
import { formatTime, getYouTubeEmbedUrl, extractVideoId } from '../utils/youtube';

export default function Course() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [completedChunks, setCompletedChunks] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [videoId, setVideoId] = useState<string>('');

  useEffect(() => {
    if (!taskId) {
      navigate('/');
      return;
    }

    const pollStatus = async () => {
      try {
        const statusResponse = await courseAPI.getProcessingStatus(taskId);
        setStatus(statusResponse);

        if (statusResponse.status === 'completed' && statusResponse.result) {
          setCourseData(statusResponse.result);
          setIsLoading(false);
          
          // Extract video ID from the response
          if (statusResponse.video_id) {
            setVideoId(statusResponse.video_id);
          } else if (statusResponse.video_url) {
            const extractedId = extractVideoId(statusResponse.video_url);
            if (extractedId) {
              setVideoId(extractedId);
            }
          }
        } else if (statusResponse.status === 'failed') {
          addToast({
            type: 'error',
            title: 'Course Generation Failed',
            description: statusResponse.message || 'An error occurred during course generation'
          });
          setIsLoading(false);
        } else {
          // Still processing, poll again
          setTimeout(pollStatus, 2000);
        }
      } catch (error: any) {
        console.error('Error polling status:', error);
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to check course generation status'
        });
        setIsLoading(false);
      }
    };

    pollStatus();
  }, [taskId, navigate, addToast]);

  const currentChunk = courseData[currentChunkIndex];
  const currentQuestions = currentChunk?.questions || [];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    const questionKey = `${currentChunkIndex}-${currentQuestionIndex}`;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionKey]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Show results for this chunk
      setShowResults(true);
    }
  };

  const handleCompleteChunk = () => {
    // Check if all questions were answered correctly
    const allCorrect = currentQuestions.every((question, index) => {
      const questionKey = `${currentChunkIndex}-${index}`;
      return selectedAnswers[questionKey] === question.correct_answer;
    });

    if (allCorrect) {
      setCompletedChunks(prev => new Set([...prev, currentChunkIndex]));
      addToast({
        type: 'success',
        title: 'Chunk Completed!',
        description: 'Great job! You can now proceed to the next section.'
      });
    } else {
      addToast({
        type: 'warning',
        title: 'Some Incorrect Answers',
        description: 'Review the explanations and try again.'
      });
    }

    // Move to next chunk or show completion
    if (currentChunkIndex < courseData.length - 1) {
      setCurrentChunkIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setShowResults(false);
    } else {
      addToast({
        type: 'success',
        title: 'Course Completed!',
        description: 'Congratulations on completing the entire course!'
      });
    }
  };

  const getQuestionResult = (questionIndex: number) => {
    const questionKey = `${currentChunkIndex}-${questionIndex}`;
    const selectedAnswer = selectedAnswers[questionKey];
    const correctAnswer = currentQuestions[questionIndex]?.correct_answer;
    return selectedAnswer === correctAnswer;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="text-center py-12">
            <RefreshCw className="h-12 w-12 text-primary-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold mb-4">Generating Your Course</h2>
            {status && (
              <div className="max-w-md mx-auto">
                <Progress 
                  value={status.current_step} 
                  max={status.total_steps} 
                  showLabel 
                  className="mb-4" 
                />
                <p className="text-gray-600">{status.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!courseData.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Course Data Available</h2>
            <p className="text-gray-600 mb-6">
              There was an issue generating your course. Please try again.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Interactive Course</h1>
          <p className="text-gray-600">
            Section {currentChunkIndex + 1} of {courseData.length}
          </p>
        </div>
        <div className="w-24" /> {/* Spacer */}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card padding={false}>
            <div className="aspect-video">
              {videoId ? (
                <iframe
                  src={getYouTubeEmbedUrl(videoId)}
                  className="w-full h-full rounded-t-xl"
                  allowFullScreen
                  title="Course Video"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-t-xl flex items-center justify-center">
                  <Play className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Current Chunk Info */}
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">
                {currentChunk?.chunk.title || `Section ${currentChunkIndex + 1}`}
              </h2>
              <p className="text-gray-600 mb-4">
                {currentChunk?.chunk.summary}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(currentChunk?.chunk.start_time || 0)} - {formatTime(currentChunk?.chunk.end_time || 0)}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress 
                value={completedChunks.size} 
                max={courseData.length} 
                showLabel 
                className="mb-4" 
              />
              <p className="text-sm text-gray-600">
                {completedChunks.size} of {courseData.length} sections completed
              </p>
            </CardContent>
          </Card>

          {/* Section Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {courseData.map((chunk, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (completedChunks.has(index) || index === 0 || completedChunks.has(index - 1)) {
                        setCurrentChunkIndex(index);
                        setCurrentQuestionIndex(0);
                        setShowResults(false);
                      }
                    }}
                    disabled={index > 0 && !completedChunks.has(index - 1) && !completedChunks.has(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      index === currentChunkIndex
                        ? 'border-primary-500 bg-primary-50'
                        : completedChunks.has(index)
                        ? 'border-green-200 bg-green-50'
                        : index === 0 || completedChunks.has(index - 1)
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {chunk.chunk.title || `Section ${index + 1}`}
                      </span>
                      {completedChunks.has(index) && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatTime(chunk.chunk.start_time)} - {formatTime(chunk.chunk.end_time)}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quiz Section */}
      {currentChunk && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                Quiz: {currentChunk.chunk.title || `Section ${currentChunkIndex + 1}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showResults ? (
                <div>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">
                        Question {currentQuestionIndex + 1} of {currentQuestions.length}
                      </span>
                      <Progress 
                        value={currentQuestionIndex + 1} 
                        max={currentQuestions.length} 
                        className="w-32" 
                      />
                    </div>
                    
                    {currentQuestion && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          {currentQuestion.question}
                        </h3>
                        
                        <div className="space-y-3">
                          {currentQuestion.options.map((option, index) => {
                            const questionKey = `${currentChunkIndex}-${currentQuestionIndex}`;
                            const isSelected = selectedAnswers[questionKey] === index;
                            
                            return (
                              <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                                  isSelected
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                    isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <div className="w-full h-full rounded-full bg-white scale-50" />
                                    )}
                                  </div>
                                  <span>{option}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentQuestionIndex > 0) {
                          setCurrentQuestionIndex(prev => prev - 1);
                        }
                      }}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>
                    
                    <Button
                      onClick={handleNextQuestion}
                      disabled={!selectedAnswers[`${currentChunkIndex}-${currentQuestionIndex}`] && selectedAnswers[`${currentChunkIndex}-${currentQuestionIndex}`] !== 0}
                    >
                      {currentQuestionIndex < currentQuestions.length - 1 ? 'Next Question' : 'Show Results'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold mb-6">Quiz Results</h3>
                  
                  <div className="space-y-6">
                    {currentQuestions.map((question, index) => {
                      const isCorrect = getQuestionResult(index);
                      const questionKey = `${currentChunkIndex}-${index}`;
                      const selectedAnswer = selectedAnswers[questionKey];
                      
                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium flex-1">{question.question}</h4>
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                            ) : (
                              <div className="h-5 w-5 bg-red-500 rounded-full ml-2" />
                            )}
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`p-2 rounded ${
                                  optionIndex === question.correct_answer
                                    ? 'bg-green-100 text-green-800'
                                    : optionIndex === selectedAnswer && !isCorrect
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-50'
                                }`}
                              >
                                {option}
                                {optionIndex === question.correct_answer && (
                                  <span className="ml-2 text-green-600 font-medium">✓ Correct</span>
                                )}
                                {optionIndex === selectedAnswer && !isCorrect && (
                                  <span className="ml-2 text-red-600 font-medium">✗ Your answer</span>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-8 text-center">
                    <Button onClick={handleCompleteChunk} size="lg">
                      {currentChunkIndex < courseData.length - 1 ? 'Continue to Next Section' : 'Complete Course'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}