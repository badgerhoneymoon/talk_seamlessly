import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, direction } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    if (!direction || !['vi-to-en', 'en-to-vi'].includes(direction)) {
      return NextResponse.json(
        { error: 'Invalid translation direction' },
        { status: 400 }
      );
    }

    // Translate text using GPT-4o
    const translationResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text ${direction === 'en-to-vi' ? 'from English to Vietnamese' : 'from Vietnamese to English'}. 

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
          content: text
        }
      ],
      temperature: 0.3,
    });

    console.log('🎯 Text input:', text);
    console.log('🎯 Direction:', direction);
    console.log('🎯 Translation:', translationResponse.choices[0]?.message?.content);

    const translatedText = translationResponse.choices[0]?.message?.content?.trim() || 'Translation failed';

    return NextResponse.json({
      originalText: text.trim(),
      translatedText: translatedText,
      direction,
      success: true
    });

  } catch (error) {
    console.error('Translation error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}