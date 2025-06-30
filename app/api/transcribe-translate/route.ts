import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    const direction = formData.get('direction') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    if (!direction || !['vi-to-en', 'en-to-vi'].includes(direction)) {
      return NextResponse.json(
        { error: 'Invalid translation direction' },
        { status: 400 }
      );
    }

    // Convert File to buffer for OpenAI API
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a File-like object that OpenAI expects
    const file = new File([buffer], audioFile.name, {
      type: audioFile.type,
    });

    // Get transcription
    const transcription = await openai.audio.transcriptions.create({
      model: 'gpt-4o-transcribe',
      file: file,
      response_format: 'text',
      language: direction === 'en-to-vi' ? 'en' : 'vi',
    });

    // Get translation
    const translationResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Translate the following text ${direction === 'en-to-vi' ? 'from English to Vietnamese' : 'from Vietnamese to English'}. Return only the translation, nothing else.`
        },
        {
          role: 'user',
          content: transcription
        }
      ],
      temperature: 0.3,
    });

    console.log('🎯 Transcription:', transcription);
    console.log('🎯 Direction:', direction);
    console.log('🎯 Translation:', translationResponse.choices[0]?.message?.content);

    // Return transcription as originalText and translation as translatedText
    const originalText = transcription.trim();
    const translatedText = translationResponse.choices[0]?.message?.content?.trim() || 'Translation failed';

    return NextResponse.json({
      originalText,
      translatedText,
      direction,
      success: true
    });

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to transcribe and translate audio' },
      { status: 500 }
    );
  }
}