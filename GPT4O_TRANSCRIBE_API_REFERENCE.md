# GPT-4o Transcribe API Reference

## Overview

OpenAI's Audio API provides speech-to-text endpoints with newer high-quality model snapshots:
- `gpt-4o-transcribe` - State-of-the-art transcription model
- `gpt-4o-mini-transcribe` - More affordable transcription model

Both models support the same capabilities as the traditional `whisper-1` model but with improved accuracy and GPT-4o-style prompting capabilities.

## Endpoint

`POST https://api.openai.com/v1/audio/transcriptions`

## Supported Models

| Model | Description | Pricing |
|-------|-------------|---------|
| `gpt-4o-transcribe` | Highest quality transcription | ~$0.006/minute |
| `gpt-4o-mini-transcribe` | Cost-effective transcription | ~$0.003/minute |
| `whisper-1` | Legacy model | ~$0.006/minute |

## File Requirements

- **Size limit**: 25 MB maximum
- **Supported formats**: `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `wav`, `webm`
- **Languages**: 98+ languages (Vietnamese, English, etc.)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | file | Yes | Audio file to transcribe |
| `model` | string | Yes | `gpt-4o-transcribe` or `gpt-4o-mini-transcribe` |
| `prompt` | string | No | Context to improve transcription quality |
| `response_format` | string | No | `json` (default) or `text` |
| `language` | string | No | ISO language code (e.g., "vi", "en") |
| `temperature` | number | No | Sampling temperature (0-1) |
| `stream` | boolean | No | Enable streaming responses |

**Note**: `gpt-4o-transcribe` models only support `json` or `text` response formats (no `verbose_json`, `srt`, `vtt`)

## Basic Usage

### Simple Transcription

**Python:**
```python
from openai import OpenAI

client = OpenAI()

audio_file = open("/path/to/file/audio.mp3", "rb")
transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe",
    file=audio_file
)
print(transcription.text)
```

**JavaScript:**
```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream("/path/to/file/audio.mp3"),
    model: "gpt-4o-transcribe",
});
console.log(transcription.text);
```

**cURL:**
```bash
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/audio.mp3 \
  --form model=gpt-4o-transcribe
```

### With Response Format

**Python:**
```python
transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe",
    file=audio_file,
    response_format="text"
)
print(transcription)  # Direct text output
```

### With Language Specification

**Python:**
```python
transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe",
    file=audio_file,
    language="vi"  # Vietnamese
)
```

## Advanced Usage with Prompting

### Transcription + Translation in One Call

**Python:**
```python
def transcribe_and_translate(audio_file, source_lang, target_lang):
    transcription = client.audio.transcriptions.create(
        model="gpt-4o-transcribe",
        file=audio_file,
        prompt=f"Transcribe this {source_lang} audio and translate it to {target_lang}. Provide only the {target_lang} translation."
    )
    return transcription.text

# Usage
with open("vietnamese_audio.mp3", "rb") as audio:
    english_text = transcribe_and_translate(audio, "Vietnamese", "English")
```

### Context-Aware Transcription

**Python:**
```python
transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe",
    file=audio_file,
    prompt="This is a conversation about technology, AI, and Vietnamese culture. Include proper nouns like OpenAI, GPT, and Vietnamese names accurately."
)
```

### Technical Terms & Acronyms

**Python:**
```python
transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe",
    file=audio_file,
    prompt="Technical discussion about: APIs, HTTP, JSON, REST, GraphQL, TypeScript, Next.js, React, Node.js"
)
```

## Streaming Transcription

### Stream Completed Audio

**Python:**
```python
stream = client.audio.transcriptions.create(
    model="gpt-4o-mini-transcribe",
    file=audio_file,
    response_format="text",
    stream=True
)

for event in stream:
    print(event)  # Process chunks as they arrive
```

**JavaScript:**
```javascript
const stream = await openai.audio.transcriptions.create({
    file: fs.createReadStream("/path/to/file/speech.mp3"),
    model: "gpt-4o-mini-transcribe",
    response_format: "text",
    stream: true,
});

for await (const event of stream) {
    console.log(event);
}
```

### Real-time Streaming (WebSocket)

For real-time audio streaming, use the Realtime API:

```text
wss://api.openai.com/v1/realtime?intent=transcription
```

**Session Configuration:**
```json
{
    "type": "transcription_session.update",
    "input_audio_format": "pcm16",
    "input_audio_transcription": {
        "model": "gpt-4o-transcribe",
        "prompt": "Context for better transcription",
        "language": "vi"
    },
    "turn_detection": {
        "type": "server_vad",
        "threshold": 0.5,
        "prefix_padding_ms": 300,
        "silence_duration_ms": 500
    }
}
```

## Response Formats

### JSON Response (Default)
```json
{
    "text": "Xin chào, tôi là một trợ lý AI."
}
```

### Text Response
```text
Xin chào, tôi là một trợ lý AI.
```

## Language Support

**Supported Languages** (98+ total):
- Vietnamese (`vi`)
- English (`en`) 
- Chinese (`zh`)
- Spanish (`es`)
- French (`fr`)
- German (`de`)
- Japanese (`ja`)
- Korean (`ko`)
- And many more...

Use ISO 639-1 or 639-3 language codes, or prompt with language names.

## Error Handling

**Python:**
```python
try:
    transcription = client.audio.transcriptions.create(
        model="gpt-4o-transcribe",
        file=audio_file
    )
except openai.APIError as e:
    print(f"OpenAI API error: {e}")
except FileNotFoundError:
    print("Audio file not found")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## Large Files

For files > 25MB, split using PyDub:

**Python:**
```python
from pydub import AudioSegment

audio = AudioSegment.from_mp3("large_file.mp3")
ten_minutes = 10 * 60 * 1000  # milliseconds
chunk = audio[:ten_minutes]
chunk.export("chunk_1.mp3", format="mp3")
```

## Best Practices

### Prompting Guidelines

1. **Be specific**: "Transcribe this Vietnamese business meeting about technology"
2. **Include context**: "Discussion about OpenAI, GPT models, and AI development"
3. **Specify format**: "Provide formal Vietnamese text with proper punctuation"
4. **For translation**: "Transcribe Vietnamese and translate to natural English"

### Performance Tips

1. **Use appropriate model**:
   - `gpt-4o-transcribe` for highest accuracy
   - `gpt-4o-mini-transcribe` for cost optimization

2. **Optimize audio quality**:
   - Clear audio improves accuracy
   - Reduce background noise
   - Use appropriate audio formats

3. **Chunking strategy**:
   - Keep chunks under 25MB
   - Don't break mid-sentence
   - Overlap chunks slightly for context

### Vietnamese-English Translation

**Single-call approach (recommended):**
```python
def vietnamese_to_english(audio_file):
    return client.audio.transcriptions.create(
        model="gpt-4o-transcribe",
        file=audio_file,
        language="vi",
        prompt="Transcribe this Vietnamese audio and translate to natural, fluent English. Preserve the meaning and tone."
    ).text

def english_to_vietnamese(audio_file):
    return client.audio.transcriptions.create(
        model="gpt-4o-transcribe", 
        file=audio_file,
        language="en",
        prompt="Transcribe this English audio and translate to natural, fluent Vietnamese. Preserve the meaning and tone."
    ).text
```

## Pricing

- **gpt-4o-transcribe**: $6.00 per 1M audio tokens (~$0.006 per minute)
- **gpt-4o-mini-transcribe**: $3.00 per 1M audio tokens (~$0.003 per minute)
- **whisper-1**: $6.00 per 1M audio tokens (~$0.006 per minute)

## Migration from Whisper

**From whisper-1:**
```python
# Old
transcription = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file
)

# New
transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe",  # Better accuracy
    file=audio_file,
    prompt="Context for better results"  # Enhanced prompting
)
```

**Key differences:**
- Better accuracy with gpt-4o models
- Enhanced prompting capabilities
- Only `json`/`text` response formats
- No timestamp granularities (use whisper-1 if needed)

---

*Last updated: July 2025 - Based on official OpenAI documentation*