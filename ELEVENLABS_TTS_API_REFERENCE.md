# ElevenLabs Text-to-Speech API Reference

This document provides comprehensive API reference for implementing ElevenLabs Text-to-Speech in our Vietnamese/English translation app.

## Overview

ElevenLabs offers superior TTS quality with specific support for 32 languages including Vietnamese. Their API provides advanced voice customization, streaming capabilities, and high-quality audio generation.

## Installation

### JavaScript/Node.js
```bash
npm install @elevenlabs/elevenlabs-js
npm install dotenv
```

## Authentication

```javascript
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});
```

## Basic Text-to-Speech Implementation

### Simple Text-to-Speech
```javascript
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import 'dotenv/config';

const elevenlabs = new ElevenLabsClient();

const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
  text: 'Hello! This is ElevenLabs text-to-speech.',
  modelId: 'eleven_multilingual_v2',
  outputFormat: 'mp3_44100_128',
});

// Returns audio stream
```

### Streaming Text-to-Speech
```javascript
const audioStream = await elevenlabs.textToSpeech.stream('JBFqnCBsd6RMkjVDRZzb', {
  text: 'This is streaming text-to-speech',
  modelId: 'eleven_multilingual_v2',
  voiceSettings: {
    stability: 0.5,
    similarityBoost: 0.75,
    speed: 1.0,
    useSpeakerBoost: true,
  },
});

// Process audio stream
for await (const chunk of audioStream) {
  console.log(chunk);
}
```

## Voice Settings Parameters

```javascript
const voiceSettings = {
  stability: 0.5,        // 0.0 - 1.0 (emotional range vs consistency)
  similarityBoost: 0.75, // 0.0 - 1.0 (adherence to original voice)
  speed: 1.0,           // 0.7 - 1.2 (speaking rate)
  useSpeakerBoost: true, // Enhanced voice clarity
  style: 0.0,           // 0.0 - 1.0 (style exaggeration)
};
```

## Supported Models

### Primary Models
- **`eleven_multilingual_v2`**: Best for Vietnamese and multilingual content
- **`eleven_flash_v2_5`**: Fastest response time, good quality
- **`eleven_turbo_v2_5`**: Optimized for speed with 32 language support

### Model Selection Guidelines
- **Vietnamese**: Use `eleven_multilingual_v2` for best pronunciation
- **English**: Any model works well, `eleven_flash_v2_5` for speed
- **Real-time**: Use `eleven_flash_v2_5` for low latency

## Premium Voices for Vietnamese

### Recommended Voices
```javascript
const vietnameseVoices = [
  {
    id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    description: 'Deep, clear male voice - good for Vietnamese'
  },
  {
    id: 'piTKgcLEGmPE4e6mEKli', 
    name: 'Nicole',
    description: 'Soft female voice - excellent Vietnamese pronunciation'
  },
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    description: 'Calm female voice - clear Vietnamese tones'
  }
];
```

## Audio Output Formats

### Supported Formats
```javascript
const outputFormats = [
  // MP3 Options
  'mp3_22050_32',   // Compact size
  'mp3_44100_128',  // Standard quality
  'mp3_44100_192',  // High quality
  
  // PCM Options  
  'pcm_16000',      // Telephony
  'pcm_22050',      // Standard
  'pcm_44100',      // CD quality
  'pcm_48000',      // Professional
  
  // Opus Options (NEW)
  'opus_48000_64',  // Compressed, good quality
  'opus_48000_128', // Compressed, high quality
];
```

## Language Support

### Vietnamese Language Implementation
```javascript
// Specific Vietnamese TTS call
const vietnameseAudio = await elevenlabs.textToSpeech.convert(voiceId, {
  text: 'Xin chào! Tôi là trợ lý AI của bạn.',
  modelId: 'eleven_multilingual_v2',
  outputFormat: 'mp3_44100_128',
  voiceSettings: {
    stability: 0.6,      // Higher stability for tonal languages
    similarityBoost: 0.8, // Strong adherence for pronunciation
    speed: 0.9,          // Slightly slower for clarity
    useSpeakerBoost: true,
  },
});
```

### Language-Specific Settings
```javascript
const languageSettings = {
  vietnamese: {
    stability: 0.6,        // Higher for tonal accuracy
    similarityBoost: 0.8,  // Strong pronunciation adherence
    speed: 0.85,          // Slower for tone clarity
    useSpeakerBoost: true
  },
  english: {
    stability: 0.5,        // More expressive
    similarityBoost: 0.75, // Balanced
    speed: 1.0,           // Normal speed
    useSpeakerBoost: true
  }
};
```

## Advanced Features

### Text Normalization
```javascript
const audio = await elevenlabs.textToSpeech.convert(voiceId, {
  text: 'Phone: +1-555-0123, Email: user@example.com',
  modelId: 'eleven_multilingual_v2',
  applyTextNormalization: true, // Normalizes phone numbers, emails, etc.
});
```

### Contextual Speech (Large Text)
```javascript
// For maintaining natural flow across long text segments
const audio = await elevenlabs.textToSpeech.convert(voiceId, {
  text: currentSegment,
  previousText: previousSegment,    // Context for natural flow
  nextText: nextSegment,           // Future context
  modelId: 'eleven_multilingual_v2',
});
```

## Implementation for Translation App

### Complete Implementation Example
```javascript
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export class ElevenLabsTTS {
  constructor(apiKey) {
    this.client = new ElevenLabsClient({ apiKey });
    this.cache = new Map();
  }

  async generateSpeech(text, language, options = {}) {
    const {
      voiceId = this.getVoiceForLanguage(language),
      speed = this.getSpeedForLanguage(language),
      useCache = true
    } = options;

    const cacheKey = `${text}-${language}-${voiceId}-${speed}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const audio = await this.client.textToSpeech.convert(voiceId, {
        text,
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
        voiceSettings: this.getVoiceSettings(language, speed),
      });

      const audioBuffer = await this.streamToBuffer(audio);
      
      if (useCache) {
        this.cache.set(cacheKey, audioBuffer);
      }

      return audioBuffer;
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      throw error;
    }
  }

  getVoiceForLanguage(language) {
    const voices = {
      'vi-VN': 'piTKgcLEGmPE4e6mEKli', // Nicole - excellent Vietnamese
      'en-US': '21m00Tcm4TlvDq8ikWAM', // Rachel - clear English
    };
    return voices[language] || voices['en-US'];
  }

  getVoiceSettings(language, speed = 1.0) {
    const settings = {
      'vi-VN': {
        stability: 0.6,
        similarityBoost: 0.8,
        speed: speed * 0.9, // Slower for Vietnamese tones
        useSpeakerBoost: true,
      },
      'en-US': {
        stability: 0.5,
        similarityBoost: 0.75,
        speed: speed,
        useSpeakerBoost: true,
      }
    };
    return settings[language] || settings['en-US'];
  }

  async streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}
```

### Next.js API Route Implementation
```javascript
// /app/api/elevenlabs-tts/route.js
import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(request) {
  try {
    const { text, language, voiceId, speed = 1.0 } = await request.json();

    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text,
      modelId: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128',
      voiceSettings: {
        stability: language === 'vi-VN' ? 0.6 : 0.5,
        similarityBoost: language === 'vi-VN' ? 0.8 : 0.75,
        speed: language === 'vi-VN' ? speed * 0.9 : speed,
        useSpeakerBoost: true,
      },
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('ElevenLabs TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
```

## Error Handling

### Comprehensive Error Handling
```javascript
async function handleTTSRequest(text, language) {
  try {
    const audio = await elevenlabs.textToSpeech.convert(voiceId, options);
    return audio;
  } catch (error) {
    if (error.status === 429) {
      // Rate limit exceeded
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.status === 401) {
      // Authentication error
      throw new Error('Invalid API key.');
    } else if (error.status === 400) {
      // Bad request (text too long, invalid parameters)
      throw new Error('Invalid request parameters.');
    } else {
      // Network or other errors
      throw new Error('TTS service temporarily unavailable.');
    }
  }
}
```

## Performance Optimization

### Caching Strategy
```javascript
class TTSCache {
  constructor(maxSize = 100, ttl = 3600000) { // 1 hour TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
}
```

## Pricing Considerations

### Cost Optimization
- **Model Selection**: `eleven_flash_v2_5` is cheaper than `eleven_multilingual_v2`
- **Output Format**: Lower bitrate formats reduce costs
- **Caching**: Implement aggressive caching for repeated text
- **Text Length**: Optimize text length (shorter = cheaper)

### Usage Monitoring
```javascript
const usageTracker = {
  characterCount: 0,
  requestCount: 0,
  
  trackUsage(text) {
    this.characterCount += text.length;
    this.requestCount++;
    console.log(`TTS Usage - Characters: ${this.characterCount}, Requests: ${this.requestCount}`);
  }
};
```

## Testing & Quality Assurance

### Vietnamese Pronunciation Testing
```javascript
const vietnameseTestPhrases = [
  'Xin chào, tôi tên là AI assistant.',
  'Hôm nay trời đẹp quá!',
  'Bạn có khỏe không?',
  'Cảm ơn bạn rất nhiều.',
  'Hẹn gặp lại bạn sau.',
];

// Test different voices for Vietnamese
async function testVietnameseVoices() {
  const voices = ['piTKgcLEGmPE4e6mEKli', 'pNInz6obpgDQGcFmaJgB'];
  
  for (const voiceId of voices) {
    for (const phrase of vietnameseTestPhrases) {
      const audio = await generateSpeech(phrase, 'vi-VN', { voiceId });
      // Listen and evaluate quality
    }
  }
}
```

## Integration Benefits vs OpenAI TTS

### ElevenLabs Advantages
✅ **Superior Vietnamese pronunciation** - Native Vietnamese language support  
✅ **Better voice quality** - More natural and expressive voices  
✅ **Advanced voice customization** - Fine-grained control over voice characteristics  
✅ **Streaming support** - Real-time audio generation  
✅ **Multiple output formats** - Including high-quality options  
✅ **Contextual awareness** - Better handling of long text with context  

### Performance Comparison
- **Quality**: ElevenLabs > OpenAI for Vietnamese
- **Speed**: Similar latency for both services
- **Cost**: Generally comparable, depends on usage patterns
- **Reliability**: Both services offer high uptime

## Conclusion

ElevenLabs provides significantly better Vietnamese TTS quality compared to OpenAI, making it the ideal choice for the Vietnamese portion of our translation app while maintaining OpenAI TTS for English to preserve our existing quality and integration.