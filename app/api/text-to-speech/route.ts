import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, language, voice, speed } = await request.json();
    
    console.log('🎯 TTS API received request:');
    console.log('📝 Text to synthesize:', JSON.stringify(text));
    console.log('🌍 Language:', language);
    console.log('🎭 Voice:', voice);
    console.log('⚡ Speed:', speed);
    console.log('📏 Text length:', text?.length || 0);
    console.log('🔤 Text characters:', text.split('').map((c: string) => `"${c}"`).join(', '));
    
    if (!text) {
      console.log('❌ No text provided');
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Use provided voice or fallback to defaults
    const selectedVoice = voice || (language === 'vi-VN' ? 'shimmer' : 'alloy');
    console.log('🎭 Selected voice:', selectedVoice);
    
    // Clean and prepare text for TTS to avoid interpretation issues
    const cleanText = text.trim();
    
    const ttsParams = {
      model: 'tts-1' as const,
      voice: selectedVoice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: cleanText,
      response_format: 'mp3' as const,
      speed: speed || 1.0,
    };
    
    console.log('📤 Sending to OpenAI TTS:', JSON.stringify(ttsParams));
    
    console.log('🔧 OpenAI TTS params:', ttsParams);
    
    const mp3 = await openai.audio.speech.create(ttsParams);
    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    console.log('✅ TTS generation successful, buffer size:', buffer.length, 'bytes');
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('❌ TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}