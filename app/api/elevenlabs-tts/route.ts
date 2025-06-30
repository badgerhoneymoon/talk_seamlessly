import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Vietnamese-optimized voice settings
const VIETNAMESE_VOICE_SETTINGS = {
  stability: 0.6,        // Higher stability for tonal accuracy
  similarityBoost: 0.8,  // Strong pronunciation adherence
  useSpeakerBoost: true,
  style: 0.0,
};

// Vietnamese voice ID
const VIETNAMESE_VOICE_ID = 'Wzj3w9OuQFcoiuKPnk3j';

export async function POST(request: NextRequest) {
  try {
    const { text, speed = 1.0 } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Adjust speed for Vietnamese (slightly slower for clarity)
    const adjustedSpeed = speed * 0.9;

    console.log('🇻🇳 ElevenLabs Vietnamese TTS Request:', {
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      voiceId: VIETNAMESE_VOICE_ID,
      speed: adjustedSpeed,
    });

    // Generate speech with ElevenLabs
    const audio = await elevenlabs.textToSpeech.convert(VIETNAMESE_VOICE_ID, {
      text,
      modelId: 'eleven_flash_v2_5',
      outputFormat: 'mp3_44100_128',
      voiceSettings: {
        ...VIETNAMESE_VOICE_SETTINGS,
        speed: adjustedSpeed,
      },
    });

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = audio.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    
    const buffer = Buffer.concat(chunks);

    console.log('✅ ElevenLabs TTS Success:', {
      audioSize: buffer.length,
      text: text.substring(0, 30) + '...',
    });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });

  } catch (error: any) {
    console.error('❌ ElevenLabs TTS Error:', error);
    
    // Handle specific ElevenLabs errors
    let errorMessage = 'Failed to generate Vietnamese speech';
    let statusCode = 500;

    if (error.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
      statusCode = 429;
    } else if (error.status === 401) {
      errorMessage = 'Invalid ElevenLabs API key.';
      statusCode = 401;
    } else if (error.status === 400) {
      errorMessage = 'Invalid request parameters.';
      statusCode = 400;
    } else if (error.message?.includes('insufficient credits')) {
      errorMessage = 'Insufficient ElevenLabs credits. Please add more credits to your account.';
      statusCode = 402;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}