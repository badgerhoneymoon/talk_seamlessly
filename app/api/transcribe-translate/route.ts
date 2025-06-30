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

    if (!direction || !['vi-to-en', 'en-to-vi', 'vi-to-ru', 'ru-to-vi'].includes(direction)) {
      return NextResponse.json(
        { error: 'Invalid translation direction' },
        { status: 400 }
      );
    }

    // Convert File to buffer for OpenAI API
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('🎤 Audio Debug Info:');
    console.log('📁 Original file name:', audioFile.name);
    console.log('📏 Original file size:', audioFile.size, 'bytes');
    console.log('🎵 Original file type:', audioFile.type);
    console.log('⚡ Buffer size:', buffer.length, 'bytes');

    // Validate audio file size (OpenAI limit is 25MB)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum size is 25MB.' },
        { status: 400 }
      );
    }

    // Validate minimum audio size
    if (audioFile.size < 1000) {
      console.warn('⚠️ Very small audio file detected');
    }

    // Determine optimal file extension based on MIME type
    let fileName = audioFile.name || 'recording';
    let fileType = audioFile.type;
    
    if (audioFile.type.includes('mp4')) {
      fileName = fileName.endsWith('.mp4') ? fileName : 'recording.mp4';
      fileType = 'audio/mp4';
    } else if (audioFile.type.includes('webm')) {
      fileName = fileName.endsWith('.webm') ? fileName : 'recording.webm';
      fileType = 'audio/webm';
    } else if (audioFile.type.includes('wav')) {
      fileName = fileName.endsWith('.wav') ? fileName : 'recording.wav';
      fileType = 'audio/wav';
    } else {
      // Default to mp4 for better compatibility
      fileName = 'recording.mp4';
      fileType = 'audio/mp4';
    }

    console.log('🎤 Normalized file info:');
    console.log('📁 File name:', fileName);
    console.log('🎵 File type:', fileType);

    // Create a File-like object that OpenAI expects
    const file = new File([buffer], fileName, {
      type: fileType,
    });

    // Get transcription with explicit language instruction
    const getLanguageCode = (dir: string) => {
      if (dir === 'en-to-vi') return 'en';
      if (dir === 'vi-to-en') return 'vi';
      if (dir === 'ru-to-vi') return 'ru';
      if (dir === 'vi-to-ru') return 'vi';
      return 'en';
    };

    const getPrompt = (dir: string) => {
      if (dir === 'en-to-vi') return 'This is clear English speech. Transcribe every word exactly as spoken, including any incomplete sentences or natural speech patterns.';
      if (dir === 'vi-to-en') return 'This is clear Vietnamese speech. Transcribe every word exactly as spoken, including any incomplete sentences or natural speech patterns.';
      if (dir === 'ru-to-vi') return 'This is clear Russian speech. Transcribe every word exactly as spoken, including any incomplete sentences or natural speech patterns.';
      if (dir === 'vi-to-ru') return 'This is clear Vietnamese speech. Transcribe every word exactly as spoken, including any incomplete sentences or natural speech patterns.';
      return 'Transcribe every word exactly as spoken, including any incomplete sentences or natural speech patterns.';
    };

    console.log('🤖 Sending to OpenAI Transcription:');
    console.log('📝 Model:', 'gpt-4o-transcribe');
    console.log('🌍 Language:', getLanguageCode(direction));
    console.log('💬 Prompt:', getPrompt(direction));
    console.log('📁 File size being sent:', file.size, 'bytes');

    const transcription = await openai.audio.transcriptions.create({
      model: 'gpt-4o-transcribe',
      file: file,
      response_format: 'text',
      language: getLanguageCode(direction),
      prompt: getPrompt(direction),
      temperature: 0.0, // Use deterministic transcription for consistency
    });

    console.log('✅ Transcription received:');
    console.log('📝 Raw transcription:', `"${transcription}"`);
    console.log('📏 Transcription length:', transcription.length, 'characters');

    // Validate transcription quality
    if (!transcription || transcription.trim().length === 0) {
      console.error('❌ Empty transcription received');
      return NextResponse.json(
        { error: 'No speech detected in audio. Please try speaking more clearly or closer to the microphone.' },
        { status: 400 }
      );
    }

    if (transcription.trim().length < 3) {
      console.warn('⚠️ Very short transcription received:', transcription);
    }

    // Check for common transcription issues
    const suspiciousPatterns = [
      /^[\s\.\,\!\?\-]*$/,  // Only punctuation
      /^(um|uh|hmm|er)[\s\.\,\!\?]*$/i,  // Only filler words
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(transcription.trim()));
    if (isSuspicious) {
      console.warn('⚠️ Suspicious transcription pattern detected:', transcription);
    }

    // Get translation
    const translationResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text ${
            direction === 'en-to-vi' ? 'from English to Vietnamese' :
            direction === 'vi-to-en' ? 'from Vietnamese to English' :
            direction === 'ru-to-vi' ? 'from Russian to Vietnamese' :
            direction === 'vi-to-ru' ? 'from Vietnamese to Russian' :
            'between languages'
          }. 

IMPORTANT RULES:
- Translate EXACTLY what is provided
- Do NOT add explanations, context, or additional text
- Do NOT interpret or expand on the meaning
- Return ONLY the direct translation
- Preserve the tone and style of the original text
- If the text contains names, keep them as-is`
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