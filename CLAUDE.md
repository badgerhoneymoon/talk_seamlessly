# Talk Seamlessly - Vietnamese/English Translator

A PWA (Progressive Web App) built with Next.js for seamless Vietnamese/English translation using OpenAI's gpt-4o-transcribe model for real-time audio transcription and translation in a single API call.

## Project Overview

- **Voice Input**: Push-to-talk button for audio recording
- **Text Input**: Manual typing capability
- **Bidirectional**: Vietnamese ↔ English translation
- **PWA**: iPhone-compatible progressive web app
- **Context-Aware**: Chat context for better transcription accuracy
- **Real-time**: Instant transcription and translation display
- **Performance**: Maximum speed and responsiveness - as instant as possible

## Tech Stack

- **Frontend**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **Audio**: Web Audio API for recording
- **API**: OpenAI gpt-4o-transcribe (single-call transcription + translation)
- **PWA**: next-pwa for offline capabilities

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

**Note**: Development server is typically already running. Do not suggest `npm run dev` command.

## Environment Variables

Create a `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Endpoints

- `POST /api/transcribe-translate` - Single endpoint using gpt-4o-transcribe with prompting for transcription + translation

## API Reference

See [GPT4O_TRANSCRIBE_API_REFERENCE.md](./GPT4O_TRANSCRIBE_API_REFERENCE.md) for complete API documentation.

## Key Features to Implement

1. **Audio Recording**: Push-to-talk button with Web Audio API
2. **Single-Call Processing**: Use gpt-4o-transcribe with prompting for transcription + translation in one API call
3. **Context-Aware Prompting**: Intelligent prompts for better transcription and translation accuracy
4. **Language Toggle**: Switch between VI→EN and EN→VI modes
5. **Streaming Support**: Real-time transcription with stream=True for instant feedback
6. **PWA Features**: Offline capability, install prompt, iOS optimization  
7. **Responsive UI**: Mobile-first design for iPhone usage
8. **Performance Optimization**: Minimize latency with single API calls and streaming

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js PWA   │    │   OpenAI API     │    │   User Device   │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Audio Input │ │───▶│ │              │ │    │ │   iPhone    │ │
│ │(Web Audio)  │ │    │ │gpt-4o-trans- │ │    │ │   Safari    │ │
│ └─────────────┘ │    │ │cribe + smart │ │    │ │   (PWA)     │ │
│                 │    │ │prompting     │ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ │              │ │    │                 │
│ │ Language    │ │───▶│ │Single call:  │ │    │                 │
│ │ Toggle      │ │    │ │transcription │ │    │                 │
│ │ (VI/EN)     │ │    │ │+ translation │ │    │                 │
│ └─────────────┘ │    │ │              │ │    │                 │
│                 │    │ └──────────────┘ │    │                 │
│ ┌─────────────┐ │    │                  │    │                 │
│ │ Translated  │ │◀───│  Real-time or    │    │                 │
│ │ Output      │ │    │  Streaming       │    │                 │
│ └─────────────┘ │    └──────────────────┘    └─────────────────┘
└─────────────────┘
```

## Implementation Strategy

**Single API Call Approach:**
```javascript
// Example implementation
async function transcribeAndTranslate(audioBlob, fromLang, toLang) {
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('model', 'gpt-4o-transcribe');
    formData.append('prompt', `Transcribe this ${fromLang} audio and translate to ${toLang}. Provide only the ${toLang} translation.`);
    
    const response = await fetch('/api/transcribe-translate', {
        method: 'POST',
        body: formData
    });
    
    return await response.json();
}
```

## Testing

- Manual testing on iPhone Safari
- PWA installation testing
- Audio recording permissions testing
- API integration testing

# IMPORTANT DEVELOPMENT RULES

## NO FALLBACKS IN DEVELOPMENT MODE

**NEVER USE FALLBACKS DURING DEVELOPMENT - THEY HIDE BUGS AND PREVENT PROPER TESTING!**

- DO NOT add fallback to browser TTS when OpenAI/ElevenLabs TTS fails
- DO NOT add fallback API calls when primary API fails
- DO NOT suppress errors with fallbacks
- LET FAILURES FAIL LOUDLY so bugs can be identified and fixed
- Only add fallbacks in production after thorough testing

**If an API fails, show the error - don't hide it with fallbacks!**