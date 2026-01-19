import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, BookOpen, Brain, Trophy, ArrowRight, Youtube, Zap, Target } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { courseAPI } from '../services/api';
import { isValidYouTubeUrl, extractVideoId } from '../utils/youtube';
import { useToast } from '../components/ui/Toaster';

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [level, setLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      addToast({
        type: 'error',
        title: 'URL Required',
        description: 'Please enter a YouTube URL'
      });
      return;
    }

    if (!isValidYouTubeUrl(youtubeUrl)) {
      addToast({
        type: 'error',
        title: 'Invalid URL',
        description: 'Please enter a valid YouTube URL'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await courseAPI.processCompleteCourse({
        youtube_url: youtubeUrl,
        level
      });

      const videoId = extractVideoId(youtubeUrl);
      addToast({
        type: 'success',
        title: 'Course Generation Started',
        description: `Generating course for video: ${videoId}. You will be redirected to track progress.`
      });

      // Extract task ID from response
      const taskId = response.task_id || `task_${Date.now()}`;
      
      navigate(`/course/${taskId}`);
    } catch (error: any) {
      console.error('Error starting course generation:', error);
      addToast({
        type: 'error',
        title: 'Generation Failed',
        description: error.response?.data?.detail || 'Failed to start course generation. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Transform YouTube Videos into
          <span className="block bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Interactive Courses
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Paste any YouTube video URL and our AI will create a structured learning experience 
          with content chunks, quizzes, and detailed explanations.
        </p>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Generate Your Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="YouTube URL"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                helperText="Enter any YouTube video URL with captions/subtitles"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as const).map((levelOption) => (
                    <button
                      key={levelOption}
                      type="button"
                      onClick={() => setLevel(levelOption)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        level === levelOption
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium capitalize">{levelOption}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {levelOption === 'easy' && '3 questions per section'}
                        {levelOption === 'medium' && '4 questions per section'}
                        {levelOption === 'hard' && '5 questions per section'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                loading={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Generating Course...' : 'Generate Course'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Chunking</h3>
            <p className="text-gray-600">
              Our AI analyzes video content and creates logical learning segments with timestamps.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Interactive Quizzes</h3>
            <p className="text-gray-600">
              Generate difficulty-based quizzes for each section to test understanding.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
            <p className="text-gray-600">
              Track your learning progress through each section and quiz completion.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2">Paste URL</h3>
            <p className="text-gray-600 text-sm">Enter any YouTube video URL</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2">AI Analysis</h3>
            <p className="text-gray-600 text-sm">AI extracts and analyzes content</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2">Generate Course</h3>
            <p className="text-gray-600 text-sm">Creates sections and quizzes</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
              4
            </div>
            <h3 className="font-semibold mb-2">Start Learning</h3>
            <p className="text-gray-600 text-sm">Interactive learning experience</p>
          </div>
        </div>
      </div>

      {/* Example URLs */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Try These Example URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <button
              onClick={() => setYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center">
                <Youtube className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <div className="font-medium">Sample Educational Video</div>
                  <div className="text-sm text-gray-500">Programming Tutorial</div>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}