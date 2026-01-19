import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { transcript, videoId } = await request.json();

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: 'Valid transcript array is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Combine transcript text for analysis
    const fullText = transcript.map((item: any) => item.text).join(' ');
    const totalDuration = Math.max(...transcript.map((item: any) => item.start + item.duration));

    console.log('Analyzing transcript with Gemini...');
    console.log('Total duration:', totalDuration, 'seconds');
    console.log('Text length:', fullText.length, 'characters');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
You are an expert educational content creator. Analyze the following video transcript and create a structured learning experience.

TRANSCRIPT:
${fullText}

VIDEO DURATION: ${Math.ceil(totalDuration)} seconds

INSTRUCTIONS:
1. Split the transcript into 4-8 logical learning sections based on content flow
2. For each section, provide:
   - title: A clear, descriptive title
   - start_second: When this section begins (use actual timestamps from transcript)
   - end_second: When this section ends (use actual timestamps from transcript)
   - summary: 2-3 sentences explaining key concepts covered

3. Between every section, create educational content:
   - 2-3 multiple choice questions (MCQs) with 4 options each and correct answers
   - 1 short practical task related to the section content

4. Ensure the response is valid JSON with this exact structure:
{
  "sections": [
    {
      "id": 1,
      "title": "Section Title",
      "start_second": 0,
      "end_second": 60,
      "summary": "Brief summary of what this section covers...",
      "quiz": {
        "questions": [
          {
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 0
          }
        ],
        "task": "Practical task description..."
      }
    }
  ]
}

REQUIREMENTS:
- Make sections logical and educational based on natural content breaks
- Use actual timestamps from the transcript data
- Ensure time segments don't overlap and cover the full video duration (${Math.ceil(totalDuration)} seconds)
- Make quizzes relevant and educational, not just recall
- Make tasks actionable and practical
- Use clear, engaging language
- Ensure valid JSON format

TRANSCRIPT TIMING DATA:
${transcript.map((item: any, index: number) => `${index + 1}. "${item.text}" (${item.start}s - ${item.start + item.duration}s)`).join('\n')}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // Clean up the response to ensure valid JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsedResponse = JSON.parse(text);
      
      // Validate the structure
      if (!parsedResponse.sections || !Array.isArray(parsedResponse.sections)) {
        throw new Error('Invalid response structure');
      }

      console.log(`Successfully created ${parsedResponse.sections.length} sections`);

      return NextResponse.json({
        success: true,
        data: parsedResponse,
        totalSections: parsedResponse.sections.length,
        videoDuration: totalDuration
      });

    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', text);
      
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response as JSON',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          rawResponse: text.substring(0, 500) + '...'
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in analyze API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze transcript',
        details: error.message 
      },
      { status: 500 }
    );
  }
}