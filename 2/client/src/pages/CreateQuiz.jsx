import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Youtube } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { quizRoomService, quizService } from '../services/api';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("llm");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [error, setError] = useState(null);

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty.toLowerCase());
    setIsDropdownOpen(false);
  };

  const validateYoutubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'youtube') {
      if (!youtubeUrl) {
        setError('Please enter a YouTube URL');
        return;
      }

      if (!validateYoutubeUrl(youtubeUrl)) {
        setError('Please enter a valid YouTube URL');
        return;
      }
    } else {
      if (!topic) {
        setError('Please enter a topic');
        return;
      }
    }

    if (!selectedDifficulty) {
      setError('Please select a difficulty level');
      return;
    }

    if (numQuestions < 1 || numQuestions > 20) {
      setError('Number of questions must be between 1 and 20');
      return;
    }

    setLoading(true);

    try {
      let quizData;
      if (activeTab === 'llm') {
        quizData = await quizRoomService.createQuiz(
          topic,
          numQuestions,
          selectedDifficulty
        );
        console.log(quizData);
        navigate('/quiz-preview', { state: { quiz: quizData } });
      } else {
        console.log(youtubeUrl, numQuestions, selectedDifficulty);
        const response = await quizService.generateQuiz(
          youtubeUrl,
          numQuestions,
          selectedDifficulty
        );

        if (!response || !response.quiz || !response.summary) {
          throw new Error('Invalid quiz data format');
        }
        quizData = response;
        navigate('/quiz-preview-new', { state: { quizData: response } });
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError(error.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Define generateButton first since it's used in both tabs
  const generateButton = (
    <Button 
      onClick={handleGenerateQuiz}
      disabled={loading}
      className="w-full bg-[#00FF9D]/10 border border-[#00FF9D]/30 text-[#00FF9D] hover:bg-[#00FF9D]/20 h-11"
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00FF9D] mr-2"></div>
          Generating Quiz...
        </div>
      ) : (
        'Generate Quiz'
      )}
    </Button>
  );

  // Then define llmTabContent which uses generateButton
  const difficultySelection = (
    <div className="space-y-2 relative">
      <label className="block text-sm text-gray-400 mb-1.5">
        Difficulty Level
      </label>
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-left text-white hover:border-[#00FF9D]/50 hover:ring-2 hover:ring-[#00FF9D]/20 transition-all duration-300"
      >
        {selectedDifficulty || 'Select difficulty'}
      </button>
      
      {isDropdownOpen && (
        <div className="absolute w-full mt-1 bg-black/90 border border-white/10 rounded-xl overflow-hidden z-10">
          {['Easy', 'Medium', 'Hard'].map((difficulty) => (
            <button
              key={difficulty}
              type="button"
              onClick={() => handleDifficultySelect(difficulty)}
              className="w-full px-4 py-3 text-left hover:bg-[#00FF9D]/10 hover:text-[#00FF9D] transition-all duration-300"
            >
              {difficulty}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const llmTabContent = (
    <TabsContent value="llm" className="space-y-5">
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">
          Describe the topic you want quiz for
        </label>
        <Input 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter topic description"
          className="bg-black/40 border-white/10 focus:border-[#00FF9D]/50 focus:ring-[#00FF9D]/20 h-11"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">
            Number of questions
          </label>
          <Input 
            type="number" 
            min="1"
            max="20"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            className="bg-black/40 border-white/10 focus:border-[#00FF9D]/50 focus:ring-[#00FF9D]/20 h-11"
          />
        </div>
        <div>
          {difficultySelection}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
      {generateButton}
    </TabsContent>
  );

  const youtubeTabContent = (
    <TabsContent value="youtube" className="space-y-5">
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">
          YouTube URL
        </label>
        <div className="relative">
          <Input 
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="bg-black/40 border-white/10 focus:border-[#00FF9D]/50 focus:ring-[#00FF9D]/20 pl-10 h-11"
          />
          <Youtube className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">
            Number of questions
          </label>
          <Input 
            type="number" 
            min="1"
            max="20"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="bg-black/40 border-white/10 focus:border-[#00FF9D]/50 focus:ring-[#00FF9D]/20 h-11"
          />
        </div>
        <div>
          {difficultySelection}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
      {generateButton}
    </TabsContent>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-24">
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Create <span className="text-[#00FF9D]">Quiz</span>
          </h1>
          <p className="text-xl text-gray-400">
            Generate quiz questions using AI
          </p>
        </div>

        <Card className="bg-black/40 backdrop-blur-md border border-white/10 p-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 gap-4 bg-transparent mb-6">
              <TabsTrigger 
                value="llm"
                className={`py-3 rounded-lg transition-all duration-300 ${
                  activeTab === "llm" 
                    ? 'bg-[#00FF9D] text-black font-medium'
                    : 'bg-black/50 text-gray-400 hover:text-white'
                }`}
              >
                Interact with LLM 🤖
              </TabsTrigger>
              <TabsTrigger 
                value="youtube"
                className={`py-3 rounded-lg transition-all duration-300 ${
                  activeTab === "youtube" 
                    ? 'bg-[#00FF9D] text-black font-medium'
                    : 'bg-black/50 text-gray-400 hover:text-white'
                }`}
              >
                <Youtube className="w-4 h-4 mr-2 inline-block" />
                From YT URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="llm" className="space-y-5">
              {llmTabContent}
            </TabsContent>

            <TabsContent value="youtube" className="space-y-5">
              {youtubeTabContent}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default CreateQuiz;
