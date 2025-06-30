# OpenAI Text-to-Speech (TTS) API Reference

This document provides the API reference for implementing OpenAI's Text-to-Speech functionality in our Vietnamese/English translation app.

## Overview

OpenAI's TTS API converts text into natural-sounding speech using advanced AI models. It supports multiple voices and languages, making it perfect for our translation app.

## Basic Implementation

### 1. Install OpenAI SDK
```bash
npm install openai
```

### 2. Basic TTS Example
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const mp3 = await openai.audio.speech.create({
  model: 'tts-1',
  voice: 'alloy',
  input: 'Hello world! This is OpenAI text-to-speech.',
});

const buffer = Buffer.from(await mp3.arrayBuffer());
```

### 3. Streaming Audio to File
```typescript
import fs from 'fs';

async function generateSpeech(text: string, filename: string) {
  const mp3 = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text,
  });
  
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(filename, buffer);
}
```

## API Parameters

### Models
- **`tts-1`**: Standard quality, faster generation
- **`tts-1-hd`**: Higher quality, slower generation

### Voices
- **`alloy`**: Neutral, balanced voice
- **`echo`**: Deep, resonant voice
- **`fable`**: Warm, storytelling voice
- **`onyx`**: Professional, authoritative voice
- **`nova`**: Energetic, youthful voice
- **`shimmer`**: Bright, cheerful voice

### Request Parameters
```typescript
interface SpeechCreateParams {
  model: 'tts-1' | 'tts-1-hd';
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  input: string; // Text to convert (max 4096 characters)
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac'; // Default: mp3
  speed?: number; // 0.25 to 4.0, default: 1.0
}
```

## Implementation for Our Translation App

### 1. API Route (`/api/text-to-speech`)
```typescript
// /app/api/text-to-speech/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, language, voice } = await request.json();
    
    // Select appropriate voice based on language
    const selectedVoice = voice || (language === 'vi-VN' ? 'nova' : 'alloy');
    
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: selectedVoice,
      input: text,
      response_format: 'mp3',
      speed: 1.0,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
```

### 2. Frontend Integration
```typescript
// Enhanced speakText function for TranslationOutput component
const speakText = async (text: string, language: string) => {
  if (!text) return;
  
  try {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language,
        voice: language === 'vi-VN' ? 'nova' : 'alloy',
      }),
    });

    if (!response.ok) {
      throw new Error('TTS request failed');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audio.play();
    
    // Clean up URL after playback
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(audioUrl);
    });
    
  } catch (error) {
    console.error('TTS Error:', error);
    // Fallback to browser TTS
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  }
};
```

### 3. Audio Controls Enhancement
```typescript
// Add play/pause/stop controls
interface AudioState {
  isPlaying: boolean;
  currentAudio: HTMLAudioElement | null;
  duration: number;
  currentTime: number;
}

const [audioState, setAudioState] = useState<AudioState>({
  isPlaying: false,
  currentAudio: null,
  duration: 0,
  currentTime: 0,
});

const stopAudio = () => {
  if (audioState.currentAudio) {
    audioState.currentAudio.pause();
    audioState.currentAudio.currentTime = 0;
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  }
};
```

## Language Support

### Vietnamese (vi-VN)
- Best voices: `nova`, `shimmer`
- Note: OpenAI TTS has good Vietnamese pronunciation

### English (en-US)
- All voices work well
- Recommended: `alloy` (neutral), `onyx` (professional)

## Error Handling

```typescript
try {
  const mp3 = await openai.audio.speech.create(params);
  // Success
} catch (error) {
  if (error instanceof OpenAI.APIError) {
    console.error('OpenAI API Error:', error.message);
    // Handle rate limits, auth errors, etc.
  } else {
    console.error('Network or other error:', error);
  }
  
  // Fallback to browser TTS
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}
```

## Performance Considerations

1. **Caching**: Cache generated audio files for repeated text
2. **Streaming**: For longer texts, consider chunking
3. **Fallback**: Always have browser TTS as fallback
4. **Rate Limits**: Handle OpenAI rate limits gracefully

## Cost Optimization

- Use `tts-1` for most cases (faster, cheaper)
- Use `tts-1-hd` only when high quality is essential
- Cache frequently used translations
- Implement text length limits (4096 chars max)

## Integration Benefits

✅ **Better Quality**: Superior to browser TTS
✅ **Consistent Voices**: Same quality across all devices
✅ **Language Support**: Excellent Vietnamese pronunciation
✅ **Customization**: Multiple voice options
✅ **Reliability**: More consistent than browser implementations