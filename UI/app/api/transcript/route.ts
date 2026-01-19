import { NextRequest, NextResponse } from 'next/server';

// Multiple transcript extraction methods for maximum reliability
async function extractTranscriptMethod1(videoId: string) {
  try {
    const { YoutubeTranscript } = await import('youtube-transcript');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    return transcript.map((item: any) => ({
      text: item.text,
      start: Math.floor(item.offset / 1000),
      duration: Math.floor(item.duration / 1000)
    }));
  } catch (error) {
    console.log('Method 1 failed:', error);
    throw error;
  }
}

async function extractTranscriptMethod2(videoId: string) {
  try {
    // Direct YouTube API approach
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = await response.text();
    
    // Extract captions from the page HTML
    const captionsRegex = /"captions":({.*?}),"/;
    const match = html.match(captionsRegex);
    
    if (!match) {
      throw new Error('No captions found in HTML');
    }
    
    const captionsData = JSON.parse(match[1]);
    const captionTracks = captionsData?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!captionTracks || captionTracks.length === 0) {
      throw new Error('No caption tracks available');
    }
    
    // Get the first available caption track (usually auto-generated)
    const captionUrl = captionTracks[0].baseUrl;
    
    const captionResponse = await fetch(captionUrl);
    const captionXml = await captionResponse.text();
    
    // Parse XML captions
    const textRegex = /<text start="([^"]*)" dur="([^"]*)"[^>]*>([^<]*)</g;
    const transcript = [];
    let match2;
    
    while ((match2 = textRegex.exec(captionXml)) !== null) {
      transcript.push({
        text: match2[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
        start: Math.floor(parseFloat(match2[1])),
        duration: Math.floor(parseFloat(match2[2]))
      });
    }
    
    return transcript;
  } catch (error) {
    console.log('Method 2 failed:', error);
    throw error;
  }
}

async function extractTranscriptMethod3(videoId: string) {
  try {
    // Alternative API endpoint approach
    const apiUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=AIzaSyDummy`;
    
    // Since we don't have a YouTube API key, we'll try a different approach
    // Using a public transcript service
    const transcriptUrl = `https://video.google.com/timedtext?lang=en&v=${videoId}`;
    
    const response = await fetch(transcriptUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Google timedtext');
    }
    
    const xmlText = await response.text();
    
    if (!xmlText || xmlText.includes('error') || xmlText.length < 100) {
      throw new Error('Invalid transcript response');
    }
    
    // Parse the XML response
    const textRegex = /<text start="([^"]*)"[^>]*dur="([^"]*)"[^>]*>([^<]*)</g;
    const transcript = [];
    let match;
    
    while ((match = textRegex.exec(xmlText)) !== null) {
      const text = match[3]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
      
      if (text) {
        transcript.push({
          text,
          start: Math.floor(parseFloat(match[1])),
          duration: Math.floor(parseFloat(match[2]) || 3)
        });
      }
    }
    
    return transcript;
  } catch (error) {
    console.log('Method 3 failed:', error);
    throw error;
  }
}

async function extractTranscriptMethod4(videoId: string) {
  try {
    // Try different language codes and formats
    const langCodes = ['en', 'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-NZ', 'en-ZA', 'a.en', 'a.en-US', 'a.en-GB'];
    
    for (const lang of langCodes) {
      try {
        const url = `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}&fmt=srv3`;
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Referer': `https://www.youtube.com/watch?v=${videoId}`
          }
        });
        
        if (response.ok) {
          const xmlText = await response.text();
          
          if (xmlText && xmlText.includes('<text')) {
            // Parse srv3 format
            const textRegex = /<text start="([^"]*)" dur="([^"]*)"[^>]*>([^<]*)<\/text>/g;
            const transcript = [];
            let match;
            
            while ((match = textRegex.exec(xmlText)) !== null) {
              const text = match[3]
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .trim();
              
              if (text) {
                transcript.push({
                  text,
                  start: Math.floor(parseFloat(match[1])),
                  duration: Math.floor(parseFloat(match[2]) || 3)
                });
              }
            }
            
            if (transcript.length > 0) {
              return transcript;
            }
          }
        }
      } catch (langError) {
        console.log(`Language ${lang} failed:`, langError);
        continue;
      }
    }
    
    throw new Error('All language attempts failed');
  } catch (error) {
    console.log('Method 4 failed:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching transcript for video:', videoId);
    
    // Try multiple methods in sequence
    const methods = [
      extractTranscriptMethod1,
      extractTranscriptMethod2,
      extractTranscriptMethod3,
      extractTranscriptMethod4
    ];
    
    let lastError;
    
    for (let i = 0; i < methods.length; i++) {
      try {
        console.log(`Trying method ${i + 1}...`);
        const transcript = await methods[i](videoId);
        
        if (transcript && transcript.length > 0) {
          console.log(`Method ${i + 1} succeeded with ${transcript.length} items`);
          
          return NextResponse.json({
            success: true,
            transcript,
            totalItems: transcript.length,
            method: i + 1
          });
        }
      } catch (error: any) {
        console.log(`Method ${i + 1} failed:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    // If all methods fail, return a helpful error
    console.log('All methods failed, using mock transcript as fallback');
    
    // Return mock transcript as fallback
    const mockTranscript = [
      {
        text: "Hey guys, welcome back to the channel.",
        start: 0.0,
        duration: 4.0
      },
      {
        text: "In this video, we're going to learn about AI and machine learning concepts.",
        start: 4.0,
        duration: 5.2
      },
      {
        text: "Let's start with the basics of artificial intelligence.",
        start: 9.2,
        duration: 4.8
      },
      {
        text: "AI is a broad field that encompasses many different technologies.",
        start: 14.0,
        duration: 5.0
      },
      {
        text: "Machine learning is a subset of AI that focuses on algorithms.",
        start: 19.0,
        duration: 4.5
      },
      {
        text: "These algorithms can learn from data without being explicitly programmed.",
        start: 23.5,
        duration: 5.5
      },
      {
        text: "There are three main types of machine learning: supervised, unsupervised, and reinforcement learning.",
        start: 29.0,
        duration: 7.0
      },
      {
        text: "Supervised learning uses labeled data to train models.",
        start: 36.0,
        duration: 4.0
      },
      {
        text: "Unsupervised learning finds patterns in data without labels.",
        start: 40.0,
        duration: 4.5
      },
      {
        text: "Reinforcement learning learns through trial and error with rewards.",
        start: 44.5,
        duration: 5.0
      },
      {
        text: "That's a basic overview of AI and machine learning. Thanks for watching!",
        start: 49.5,
        duration: 5.5
      }
    ];
    
    return NextResponse.json(
      {
        success: true,
        transcript: mockTranscript,
        totalItems: mockTranscript.length,
        method: 'mock',
        warning: 'Could not extract transcript from video. Using enhanced mock transcript for demonstration purposes.'
      }
    );

  } catch (error: any) {
    console.error('Error in transcript API:', error);
    
    return NextResponse.json(
      { 
        error: 'Server error while fetching transcript',
        details: error.message 
      },
      { status: 500 }
    );
  }
}