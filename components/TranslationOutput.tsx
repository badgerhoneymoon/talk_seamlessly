'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check, Volume2, Loader2 } from 'lucide-react';
import { TranslationDirection } from './TranslatorInterface';
import { useSettings } from '@/contexts/SettingsContext';

interface TranslationOutputProps {
  originalText: string;
  translatedText: string;
  error?: string;
  direction: TranslationDirection;
}

export default function TranslationOutput({ 
  originalText,
  translatedText, 
  error, 
  direction 
}: TranslationOutputProps) {
  const [isCopiedTranslated, setIsCopiedTranslated] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  const { settings } = useSettings();

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setIsCopiedTranslated(true);
      setTimeout(() => setIsCopiedTranslated(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const speakText = async (text: string, isOriginal: boolean) => {
    if (!text || isLoadingAudio || isPlayingAudio) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Determine language
    const language = isOriginal 
      ? (direction === 'en-to-vi' ? 'en-US' : 'vi-VN')
      : (direction === 'en-to-vi' ? 'vi-VN' : 'en-US');
    
    // Debug logging
    console.log('🔊 TTS Debug Info:');
    console.log('📝 Text to speak:', text);
    console.log('🌍 Language:', language);
    console.log('🎯 Is Original:', isOriginal);
    console.log('↔️ Direction:', direction);
    console.log('⚙️ TTS Provider:', settings.ttsProvider);
    console.log('🎭 Current voice setting:', settings.openaiVoice);
    console.log('📋 Full settings object:', settings);
    
    if (settings.ttsProvider === 'openai') {
      const cacheKey = `${text}-${language}-${settings.openaiVoice}`;
      
      // Check if we have cached audio
      if (audioCache[cacheKey]) {
        console.log('💾 Using cached audio for:', text.substring(0, 50) + '...');
        setIsPlayingAudio(true);
        const audio = new Audio(audioCache[cacheKey]);
        audio.play();
        
        audio.addEventListener('ended', () => {
          setIsPlayingAudio(false);
        });
        
        audio.addEventListener('error', () => {
          setIsPlayingAudio(false);
        });
      } else {
        // Fetch new audio and cache it
        setIsLoadingAudio(true);
        console.log('🌐 Sending to OpenAI TTS API:', { text, language, voice: settings.openaiVoice });
        
        try {
          const response = await fetch('/api/text-to-speech', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text,
              language,
              voice: settings.openaiVoice,
            }),
          });

          if (!response.ok) {
            throw new Error('TTS request failed');
          }

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          
          console.log('✅ OpenAI TTS response received, audio size:', audioBlob.size, 'bytes');
          
          // Cache the audio URL
          setAudioCache(prev => ({ ...prev, [cacheKey]: audioUrl }));
          
          setIsLoadingAudio(false);
          setIsPlayingAudio(true);
          
          const audio = new Audio(audioUrl);
          audio.play();
          
          audio.addEventListener('ended', () => {
            setIsPlayingAudio(false);
          });
          
          audio.addEventListener('error', () => {
            setIsPlayingAudio(false);
          });
          
        } catch (error) {
          console.error('❌ OpenAI TTS Error:', error);
          setIsLoadingAudio(false);
          // Fallback to browser TTS
          playBrowserTTS(text, language);
        }
      }
    } else {
      // Use browser TTS directly
      playBrowserTTS(text, language);
    }
  };

  const playBrowserTTS = (text: string, language: string) => {
    setIsPlayingAudio(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    
    window.speechSynthesis.speak(utterance);
  };

  if (error) {
    return (
      <Card className="p-4 border-red-200 bg-red-50">
        <div className="flex items-center space-x-2 text-red-700">
          <span className="font-medium">Error:</span>
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  if (!originalText && !translatedText) return null;

  const targetLanguage = direction === 'en-to-vi' ? 'Vietnamese' : 'English';

  return (
    <div className="space-y-4">
      {/* Only show translated text */}
      {translatedText && (
        <div className="relative">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-emerald-200 rounded-3xl blur-xl opacity-30 -z-10 transform scale-110" />
          
          <Card className="relative p-4 sm:p-6 bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-sm border border-green-200/50 rounded-3xl shadow-xl">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">
                    Translation ({targetLanguage})
                  </h3>
                </div>
                
                <div className="flex space-x-1 sm:space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakText(translatedText, false)}
                    disabled={isLoadingAudio || isPlayingAudio}
                    className="p-2 sm:p-3 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                    title="Listen to translation"
                  >
                    {isLoadingAudio ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 animate-spin" />
                    ) : (
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(translatedText)}
                    className="p-2 sm:p-3 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                    title="Copy translation"
                  >
                    {isCopiedTranslated ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/50 shadow-inner">
                <p className="text-base sm:text-lg text-gray-900 leading-relaxed font-medium">
                  {translatedText}
                </p>
                
                {/* Subtle decorative elements */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-300 rounded-full opacity-30" />
                <div className="absolute bottom-2 left-2 w-1 h-1 bg-emerald-400 rounded-full opacity-40" />
              </div>
              
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}