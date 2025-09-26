import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { recommendationService } from '../services/api';
import FlashCard from '../components/FlashCard';

const RecommendationPage = () => {
  const [videos, setVideos] = useState([]);
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to extract YouTube video IDs
  const extractVideoId = (url) => {
    // Remove any quotes and get the raw URL
    const cleanUrl = url.replace(/['"]/g, '');
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = cleanUrl.match(regex);
    return match ? match[1] : null;
  };

  // Updated function to extract YouTube video links from the new response format
  const extractYoutubeLinks = (data) => {
    const videos = [];
    
    // Iterate through each topic in the recommendations
    Object.entries(data).forEach(([topic, content]) => {
      if (content.youtube_links) {
        content.youtube_links.forEach((url) => {
          const videoId = extractVideoId(url);
          if (videoId) {
            videos.push({
              title: topic, // Using topic as title
              url: url,
              thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              description: content.overview // Using overview as description
            });
          }
        });
      }
    });
    
    return videos;
  };

  // Updated function to extract and format text content
  const parseTextContent = (data) => {
    const sections = {};
    
    Object.entries(data).forEach(([topic, content]) => {
      sections[topic] = [
        content.overview,
        content.recommendations
      ].filter(Boolean); // Remove any null/undefined values
    });
    
    return sections;
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await recommendationService.getRecommendations();
        const extractedVideos = extractYoutubeLinks(response.recommendations);
        setVideos(extractedVideos);
        setTextContent(response.recommendations);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF9D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 mt-24">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[#00FF9D] mb-4">Knowledge Hub</h1>
          <p className="text-xl text-gray-400">Curated recommendations to expand your knowledge</p>
        </div>

        {/* Text Content Sections */}
        <div className="grid gap-8">
          {Object.entries(parseTextContent(textContent)).map(([section, points], index) => (
            <div key={index} className="bg-zinc-900/50 rounded-xl p-8 backdrop-blur-sm border border-zinc-800/50">
              <h2 className="text-2xl font-bold text-[#00FF9D] mb-6">{section}</h2>
              <div className="space-y-6">
                {points.map((point, idx) => (
                  <div key={idx} className="prose prose-invert max-w-none">
                    {idx === 0 ? (
                      // Overview section
                      <div className="bg-zinc-800/30 rounded-lg p-6 border border-zinc-700/30">
                        <h3 className="text-lg font-medium text-[#00FF9D] mb-3">Overview</h3>
                        <p className="text-gray-300 leading-relaxed">{point}</p>
                      </div>
                    ) : (
                      // Recommendations section
                      <div className="bg-zinc-800/30 rounded-lg p-6 border border-zinc-700/30">
                        <h3 className="text-lg font-medium text-[#00FF9D] mb-3">Learning Path</h3>
                        <p className="text-gray-300 leading-relaxed">{point}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Video Recommendations */}
        {videos.length > 0 && (
          <div className="bg-zinc-900/50 rounded-xl p-8 backdrop-blur-sm border border-zinc-800/50">
            <h2 className="text-2xl font-bold text-[#00FF9D] mb-8">Recommended Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="group hover:scale-105 transition-all duration-300"
                >
                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    <div className="bg-black/50 rounded-xl overflow-hidden border border-zinc-800/50">
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full aspect-video object-cover"
                          onError={(e) => {
                            e.target.src = `https://img.youtube.com/vi/${extractVideoId(video.url)}/hqdefault.jpg`;
                          }}
                        />
                        <div className="absolute inset-0 bg-[#00FF9D]/10 group-hover:bg-transparent transition-colors duration-300" />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-200 group-hover:text-[#00FF9D] transition-colors duration-300 line-clamp-2">
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationPage; 