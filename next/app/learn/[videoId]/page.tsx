'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import YouTube from 'react-youtube';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CirclePlay as PlayCircle, BookOpen, Clock, CircleCheck as CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

interface Quiz {
  questions: {
    question: string;
    options: string[];
    correct_answer: number;
  }[];
  task: string;
}

interface Section {
  id: number;
  title: string;
  start_second: number;
  end_second: number;
  summary: string;
  quiz: Quiz;
}

interface CourseData {
  sections: Section[];
}

export default function LearnPage() {
  const params = useParams();
  const videoId = params.videoId as string;
  
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: string }>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch transcript
        console.log('Fetching transcript for video ID:', videoId);
        const transcriptResponse = await fetch(`/api/transcript?videoId=${videoId}`);
        const transcriptData = await transcriptResponse.json();

        if (!transcriptResponse.ok) {
          console.error('Transcript API error:', transcriptData);
          throw new Error(transcriptData.error || `Failed to fetch transcript: ${transcriptResponse.status} ${transcriptResponse.statusText}`);
        }

        if (!transcriptData.transcript || !Array.isArray(transcriptData.transcript)) {
          throw new Error('Invalid transcript data received from API');
        }

        setTranscript(transcriptData.transcript);

        // Analyze transcript with Gemini
        console.log('Analyzing transcript...');
        const analyzeResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcript: transcriptData.transcript }),
        });

        const analyzeData = await analyzeResponse.json();

        if (!analyzeResponse.ok) {
          console.error('Analysis API error:', analyzeData);
          throw new Error(analyzeData.error || `Failed to analyze transcript: ${analyzeResponse.status} ${analyzeResponse.statusText}`);
        }

        if (!analyzeData.data || !analyzeData.data.sections) {
          throw new Error('Invalid analysis data received from API');
        }

        setCourseData(analyzeData.data);
        
      } catch (err: any) {
        console.error('Error loading course data:', err);
        setError(err.message || 'An unexpected error occurred while loading the course data');
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) {
      fetchData();
    }
  }, [videoId]);

  const onPlayerReady = (event: any) => {
    setPlayer(event.target);
  };

  const seekToSection = (startTime: number) => {
    if (player) {
      player.seekTo(startTime, true);
      player.playVideo();
    }
  };

  const handleQuizSubmit = () => {
    if (!courseData) return;

    const currentSection = courseData.sections[currentSectionIndex];
    const questions = currentSection.quiz.questions;
    let allCorrect = true;

    questions.forEach((question, qIndex) => {
      const userAnswer = parseInt(quizAnswers[`${currentSectionIndex}-${qIndex}`] || '-1');
      if (userAnswer !== question.correct_answer) {
        allCorrect = false;
      }
    });

    setShowQuizResults(true);

    if (allCorrect) {
      const newCompleted = new Set(completedSections);
      newCompleted.add(currentSectionIndex);
      setCompletedSections(newCompleted);
    }
  };

  const nextSection = () => {
    setCurrentSectionIndex(prev => prev + 1);
    setQuizAnswers({});
    setShowQuizResults(false);
  };

  const canAccessSection = (index: number) => {
    return index === 0 || completedSections.has(index - 1);
  };

  const getProgressPercentage = () => {
    if (!courseData) return 0;
    return (completedSections.size / courseData.sections.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Creating Your Course</h2>
          <p className="text-gray-600">Analyzing video transcript and generating interactive content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <PlayCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Process Video</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Try Another Video
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No course data available</p>
        </div>
      </div>
    );
  }

  const currentSection = courseData.sections[currentSectionIndex];
  const isCurrentSectionCompleted = completedSections.has(currentSectionIndex);
  const canMoveToNext = isCurrentSectionCompleted && currentSectionIndex < courseData.sections.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <PlayCircle className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillVideo
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Progress: {completedSections.size} / {courseData.sections.length} sections
              </div>
              <Progress value={getProgressPercentage()} className="w-32" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r shadow-sm h-screen overflow-y-auto sticky top-0">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Sections</h2>
            <div className="space-y-2">
              {courseData.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    index === currentSectionIndex
                      ? 'bg-blue-50 border-blue-200'
                      : canAccessSection(index)
                      ? 'hover:bg-gray-50 border-gray-200'
                      : 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-60'
                  }`}
                  onClick={() => {
                    if (canAccessSection(index)) {
                      setCurrentSectionIndex(index);
                      setQuizAnswers({});
                      setShowQuizResults(false);
                      seekToSection(section.start_second);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm text-gray-900">{section.title}</h3>
                    <div className="flex items-center space-x-1">
                      {completedSections.has(index) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : !canAccessSection(index) ? (
                        <Lock className="h-4 w-4 text-gray-400" />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <Clock className="h-3 w-3" />
                    <span>{Math.floor(section.start_second / 60)}:{(section.start_second % 60).toString().padStart(2, '0')} - {Math.floor(section.end_second / 60)}:{(section.end_second % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Video Player */}
            <Card className="overflow-hidden">
              <div className="aspect-video">
                <YouTube
                  videoId={videoId}
                  onReady={onPlayerReady}
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 0,
                      modestbranding: 1,
                      rel: 0,
                    },
                  }}
                  className="w-full h-full"
                />
              </div>
            </Card>

            {/* Section Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>{currentSection.title}</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => seekToSection(currentSection.start_second)}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Jump to Section
                  </Button>
                </div>
                <CardDescription>
                  Section {currentSectionIndex + 1} of {courseData.sections.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {currentSection.summary}
                </p>

                {/* Quiz Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Quiz</h3>
                  
                  <div className="space-y-6">
                    {currentSection.quiz.questions.map((question, qIndex) => (
                      <div key={qIndex} className="space-y-3">
                        <h4 className="font-medium text-gray-900">
                          {qIndex + 1}. {question.question}
                        </h4>
                        <RadioGroup
                          value={quizAnswers[`${currentSectionIndex}-${qIndex}`] || ''}
                          onValueChange={(value) => {
                            setQuizAnswers(prev => ({
                              ...prev,
                              [`${currentSectionIndex}-${qIndex}`]: value
                            }));
                            setShowQuizResults(false);
                          }}
                          disabled={showQuizResults}
                        >
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={oIndex.toString()}
                                id={`q${qIndex}-${oIndex}`}
                                className={showQuizResults ? 
                                  (oIndex === question.correct_answer ? 'border-green-600 text-green-600' : 
                                   parseInt(quizAnswers[`${currentSectionIndex}-${qIndex}`]) === oIndex && oIndex !== question.correct_answer ? 'border-red-600 text-red-600' : '') : ''}
                              />
                              <Label
                                htmlFor={`q${qIndex}-${oIndex}`}
                                className={`cursor-pointer ${showQuizResults ? 
                                  (oIndex === question.correct_answer ? 'text-green-700 font-medium' : 
                                   parseInt(quizAnswers[`${currentSectionIndex}-${qIndex}`]) === oIndex && oIndex !== question.correct_answer ? 'text-red-700' : '') : ''}`}
                              >
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    ))}

                    {/* Practical Task */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Practical Task</h4>
                      <p className="text-blue-800">{currentSection.quiz.task}</p>
                    </div>

                    {/* Quiz Actions */}
                    <div className="flex items-center justify-between pt-4">
                      {!showQuizResults ? (
                        <Button 
                          onClick={handleQuizSubmit}
                          disabled={currentSection.quiz.questions.some((_, qIndex) => 
                            !quizAnswers[`${currentSectionIndex}-${qIndex}`]
                          )}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Submit Quiz
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <div className={`flex items-center space-x-2 ${isCurrentSectionCompleted ? 'text-green-600' : 'text-red-600'}`}>
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">
                              {isCurrentSectionCompleted ? 'Great job! Section completed.' : 'Some answers are incorrect. Please try again.'}
                            </span>
                          </div>
                          
                          <div className="flex space-x-2">
                            {!isCurrentSectionCompleted && (
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setQuizAnswers({});
                                  setShowQuizResults(false);
                                }}
                              >
                                Try Again
                              </Button>
                            )}
                            {canMoveToNext && (
                              <Button 
                                onClick={nextSection}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Next Section
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Completion */}
            {completedSections.size === courseData.sections.length && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center space-x-2">
                    <CheckCircle2 className="h-6 w-6" />
                    <span>Course Completed!</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700 mb-4">
                    Congratulations! You've successfully completed all sections of this course.
                  </p>
                  <Link href="/">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Create Another Course
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}