import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

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

    // Validate video ID format
    const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    if (!videoIdRegex.test(videoId)) {
      return NextResponse.json(
        { error: 'Invalid YouTube video ID format' },
        { status: 400 }
      );
    }

    console.log('Fetching transcript for video:', videoId);
    
    let transcript;
    try {
      // Fetch transcript using youtube-transcript package
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (transcriptError: any) {
      console.error('YouTube transcript fetch error:', transcriptError);
      
      // Handle specific error cases
      if (transcriptError.message?.includes('Could not retrieve a transcript')) {
        return NextResponse.json(
          { 
            error: 'No transcript available for this video. The video may not have captions enabled, may be private, or may not exist.',
            details: transcriptError.message 
          },
          { status: 404 }
        );
      }
      
      if (transcriptError.message?.includes('Video unavailable')) {
        return NextResponse.json(
          { 
            error: 'Video is unavailable. It may be private, deleted, or restricted.',
            details: transcriptError.message 
          },
          { status: 404 }
        );
      }
      
      // Re-throw for general error handling
      throw transcriptError;
    }
    
    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json(
        { error: 'No transcript content found for this video' },
        { status: 404 }
      );
    }
    
    // Normalize transcript items to { text, start, duration }
    const normalizedTranscript = transcript.map((item: any) => ({
      text: item.text || '',
      start: Math.floor(item.offset / 1000), // Convert to seconds
      duration: Math.floor(item.duration / 1000) // Convert to seconds
    })).filter(item => item.text.trim().length > 0); // Remove empty text items

    if (normalizedTranscript.length === 0) {
      return NextResponse.json(
        { error: 'No valid transcript content found after processing' },
        { status: 404 }
      );
    }

    console.log(`Successfully fetched ${normalizedTranscript.length} transcript items`);

    return NextResponse.json({
      success: true,
      transcript: normalizedTranscript,
      totalItems: normalizedTranscript.length
    });

  } catch (error: any) {
    console.error('Error fetching transcript:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch transcript',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}