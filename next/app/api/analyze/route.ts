import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: 'Valid transcript array is required' },
        { status: 400 }
      );
    }

    if (transcript.length === 0) {
      return NextResponse.json(
        { error: 'Transcript array cannot be empty' },
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
    const fullText = transcript.map(item => item.text).join(' ');
    
    if (fullText.trim().length < 100) {
      return NextResponse.json(
        { error: 'Transcript is too short to create a meaningful course (minimum 100 characters required)' },
        { status: 400 }
      );
    }
    
    const totalDuration = Math.max(...transcript.map(item => item.start + item.duration));

    console.log('Analyzing transcript with Gemini...');
    console.log('Total duration:', totalDuration, 'seconds');
    console.log('Text length:', fullText.length, 'characters');

    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    } catch (modelError: any) {
      console.error('Error initializing Gemini model:', modelError);
      return NextResponse.json(
        { error: 'Failed to initialize AI model. Please check your API key configuration.' },
        { status: 500 }
      );
    }

    const prompt = `
You are an expert educational content creator. Analyze the following video transcript and create a structured learning experience.

TRANSCRIPT:
${fullText}

INSTRUCTIONS:
1. Split the transcript into 6-12 logical learning sections
2. For each section, provide:
   - title: A clear, descriptive title
   - start_second: When this section begins (estimate based on content flow)
   - end_second: When this section ends
   - summary: 2-3 sentences explaining key concepts covered

3. Between every section, create educational content:
   - 3 multiple choice questions (MCQs) with 4 options each and correct answers
   - 1 short practical task related to the section content

4. Ensure the response is valid JSON with this exact structure:
{
  "sections": [
    {
      "id": 1,
      "title": "Section Title",
      "start_second": 0,
      "end_second": 120,
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
- Make sections logical and educational
- Ensure time segments don't overlap and cover the full video duration (approximately ${totalDuration} seconds)
- Make quizzes relevant and educational, not just recall
- Make tasks actionable and practical
- Use clear, engaging language
- Ensure valid JSON format
`;

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (aiError: any) {
      console.error('Error generating content with Gemini:', aiError);
      
      if (aiError.message?.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid or expired API key. Please check your Gemini API key configuration.' },
          { status: 401 }
        );
      }
      
      if (aiError.message?.includes('quota') || aiError.message?.includes('limit')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later or check your Gemini API usage limits.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to generate course content with AI. Please try again.' },
        { status: 500 }
      );
    }
    
    const response = result.response;
    let text = response.text();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'AI generated empty response. Please try again.' },
        { status: 500 }
      );
    }

    // Clean up the response to ensure valid JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsedResponse = JSON.parse(text);
      
      // Validate the structure
      if (!parsedResponse.sections || !Array.isArray(parsedResponse.sections)) {
        throw new Error('Invalid response structure');
      }

      if (parsedResponse.sections.length === 0) {
        throw new Error('No sections generated');
      }

      // Validate each section has required fields
      for (let i = 0; i < parsedResponse.sections.length; i++) {
        const section = parsedResponse.sections[i];
        if (!section.title || !section.summary || !section.quiz) {
          throw new Error(`Section ${i + 1} is missing required fields`);
        }
        if (!section.quiz.questions || !Array.isArray(section.quiz.questions) || section.quiz.questions.length === 0) {
          throw new Error(`Section ${i + 1} has invalid quiz questions`);
        }
      }

      console.log(`Successfully created ${parsedResponse.sections.length} sections`);

      return NextResponse.json({
        success: true,
        data: parsedResponse,
        totalSections: parsedResponse.sections.length
      });

    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', text);
      
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response as JSON',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          rawResponse: text.substring(0, 200) + '...'
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in analyze API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze transcript',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}