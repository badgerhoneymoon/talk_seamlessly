'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check, Volume2, Loader2, Maximize2 } from 'lucide-react';
import { TranslationDirection } from './TranslatorInterface';
import { useSettings } from '@/contexts/SettingsContext';

interface TranslationOutputProps {
  originalText: string;
  translatedText: string;
  error?: string;
  direction: TranslationDirection;
  onShowFullScreen?: () => void;
}

export default function TranslationOutput({ 
  originalText,
  translatedText, 
  error, 
  direction,
  onShowFullScreen
}: TranslationOutputProps) {
  const [isCopiedTranslated, setIsCopiedTranslated] = useState(false);
  const [isCopiedOriginal, setIsCopiedOriginal] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  const { settings } = useSettings();

  const copyToClipboard = async (text: string, isOriginal = false) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      if (isOriginal) {
        setIsCopiedOriginal(true);
        setTimeout(() => setIsCopiedOriginal(false), 2000);
      } else {
        setIsCopiedTranslated(true);
        setTimeout(() => setIsCopiedTranslated(false), 2000);
      }
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
      ? (direction === 'en-to-vi' ? 'en-US' : 
         direction === 'vi-to-en' ? 'vi-VN' :
         direction === 'ru-to-vi' ? 'ru-RU' : 'vi-VN')
      : (direction === 'en-to-vi' ? 'vi-VN' :
         direction === 'vi-to-en' ? 'en-US' :
         direction === 'ru-to-vi' ? 'vi-VN' : 'ru-RU');
    
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
      // Use ElevenLabs for Vietnamese, OpenAI for English and Russian
      const isVietnamese = language === 'vi-VN';
      const apiEndpoint = isVietnamese ? '/api/elevenlabs-tts' : '/api/text-to-speech';
      const speedToUse = isVietnamese ? settings.vietnameseTtsSpeed : settings.englishTtsSpeed; // Use English speed for Russian too
      const cacheKey = isVietnamese 
        ? `elevenlabs-${text}-${language}-${speedToUse}`
        : `${text}-${language}-${settings.openaiVoice}-${speedToUse}`;
      
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
        
        const requestBody = isVietnamese 
          ? { text, speed: speedToUse }
          : { text, language, voice: settings.openaiVoice, speed: speedToUse };
        
        console.log(`🌐 Sending to ${isVietnamese ? 'ElevenLabs' : 'OpenAI'} TTS API:`, requestBody);
        
        try {
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error('TTS request failed');
          }

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          
          console.log(`✅ ${isVietnamese ? 'ElevenLabs' : 'OpenAI'} TTS response received, audio size:`, audioBlob.size, 'bytes');
          
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
          console.error(`❌ ${isVietnamese ? 'ElevenLabs' : 'OpenAI'} TTS Error:`, error);
          setIsLoadingAudio(false);
          // NO FALLBACK IN DEV MODE - LET FAILURES FAIL LOUDLY
          throw error;
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
    const speedToUse = language === 'vi-VN' ? settings.vietnameseTtsSpeed : settings.englishTtsSpeed;
    utterance.rate = speedToUse;
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

  const getLanguageName = (dir: TranslationDirection, isTarget: boolean) => {
    if (dir === 'en-to-vi') return isTarget ? 'Vietnamese' : 'English';
    if (dir === 'vi-to-en') return isTarget ? 'English' : 'Vietnamese';
    if (dir === 'ru-to-vi') return isTarget ? 'Vietnamese' : 'Russian';
    if (dir === 'vi-to-ru') return isTarget ? 'Russian' : 'Vietnamese';
    return 'Unknown';
  };

  const targetLanguage = getLanguageName(direction, true);
  const sourceLanguage = getLanguageName(direction, false);

  return (
    <div className="space-y-4">
      {/* Original text */}
      {originalText && (
        <div className="relative">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-3xl blur-xl opacity-30 -z-10 transform scale-110" />
          
          <Card className="relative p-4 sm:p-6 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 backdrop-blur-sm border border-blue-200/50 rounded-3xl shadow-xl">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">
                    Original ({sourceLanguage})
                  </h3>
                </div>
                
                <div className="flex space-x-1 sm:space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(originalText, true)}
                    className="p-2 sm:p-3 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                    title="Copy original"
                  >
                    {isCopiedOriginal ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    ) : (
                      <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/50 shadow-inner">
                <p className="text-sm sm:text-base text-gray-900 leading-relaxed font-medium">
                  {originalText}
                </p>
                
                {/* Subtle decorative elements */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-300 rounded-full opacity-30" />
                <div className="absolute bottom-2 left-2 w-1 h-1 bg-indigo-400 rounded-full opacity-40" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Translated text */}
      {translatedText && (
        <div className="relative">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-emerald-200 rounded-3xl blur-xl opacity-30 -z-10 transform scale-110" />
          
          <Card className="relative p-6 sm:p-8 bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-sm border border-green-200/50 rounded-3xl shadow-xl">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
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
                    onClick={() => copyToClipboard(translatedText, false)}
                    className="p-2 sm:p-3 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                    title="Copy translation"
                  >
                    {isCopiedTranslated ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    )}
                  </Button>

                  {onShowFullScreen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onShowFullScreen}
                      className="p-2 sm:p-3 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                      title="Show in full screen"
                    >
                      <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/50 shadow-inner">
                <p className="text-xl sm:text-2xl lg:text-3xl text-gray-900 leading-relaxed font-semibold">
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