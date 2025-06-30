'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Volume2, Copy, Check, Loader2 } from 'lucide-react';
import { TranslationDirection } from './TranslatorInterface';
import { useSettings } from '@/contexts/SettingsContext';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  translatedText: string;
  direction: TranslationDirection;
}

export default function FullScreenModal({
  isOpen,
  onClose,
  originalText,
  translatedText,
  direction
}: FullScreenModalProps) {
  const [isCopiedOriginal, setIsCopiedOriginal] = useState(false);
  const [isCopiedTranslated, setIsCopiedTranslated] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});
  const { settings } = useSettings();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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
    
    if (settings.ttsProvider === 'openai') {
      // Use ElevenLabs for Vietnamese, OpenAI for English and Russian
      const isVietnamese = language === 'vi-VN';
      const apiEndpoint = isVietnamese ? '/api/elevenlabs-tts' : '/api/text-to-speech';
      const speedToUse = isVietnamese ? settings.vietnameseTtsSpeed : settings.englishTtsSpeed; // Use English speed for Russian too
      const cacheKey = isVietnamese 
        ? `elevenlabs-${text}-${language}-${speedToUse}`
        : `${text}-${language}-${settings.openaiVoice}-${speedToUse}`;
      
      if (audioCache[cacheKey]) {
        setIsPlayingAudio(true);
        const audio = new Audio(audioCache[cacheKey]);
        audio.play();
        
        audio.addEventListener('ended', () => setIsPlayingAudio(false));
        audio.addEventListener('error', () => setIsPlayingAudio(false));
      } else {
        setIsLoadingAudio(true);
        
        const requestBody = isVietnamese 
          ? { text, speed: speedToUse }
          : { text, language, voice: settings.openaiVoice, speed: speedToUse };
        
        try {
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) throw new Error('TTS request failed');

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          
          setAudioCache(prev => ({ ...prev, [cacheKey]: audioUrl }));
          setIsLoadingAudio(false);
          setIsPlayingAudio(true);
          
          const audio = new Audio(audioUrl);
          audio.play();
          
          audio.addEventListener('ended', () => setIsPlayingAudio(false));
          audio.addEventListener('error', () => setIsPlayingAudio(false));
          
        } catch (error) {
          console.error(`${isVietnamese ? 'ElevenLabs' : 'OpenAI'} TTS Error:`, error);
          setIsLoadingAudio(false);
          // NO FALLBACK IN DEV MODE - LET FAILURES FAIL LOUDLY
          throw error;
        }
      }
    } else {
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-y-auto">
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="fixed top-4 right-4 p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 z-50"
        title="Close (ESC)"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Content */}
      <div className="min-h-screen p-6 pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Translation
          </h1>
          <p className="text-xl text-white/80">
            {sourceLanguage} → {targetLanguage}
          </p>
        </div>


        {/* Content - stacked vertically */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Original Text */}
          {originalText && (
            <div className="bg-gradient-to-br from-blue-400/20 to-indigo-400/20 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-blue-400/30 shadow-2xl">
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <h3 className="text-xl sm:text-2xl text-white/90 font-medium">
                    Original ({sourceLanguage})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(originalText, true)}
                    className="ml-4 p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
                  >
                    {isCopiedOriginal ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Copy className="w-6 h-6" />
                    )}
                  </Button>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl text-white/80 font-normal leading-tight">
                  {originalText}
                </p>
              </div>
            </div>
          )}

          {/* Translated Text */}
          {translatedText && (
            <div className="bg-gradient-to-br from-green-400/20 to-emerald-400/20 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-green-400/30 shadow-2xl">
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <h3 className="text-xl sm:text-2xl text-white/90 font-medium">
                    Translation ({targetLanguage})
                  </h3>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText(translatedText, false)}
                      disabled={isLoadingAudio || isPlayingAudio}
                      className="p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
                    >
                      {isLoadingAudio ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Volume2 className="w-6 h-6" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(translatedText, false)}
                      className="p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
                    >
                      {isCopiedTranslated ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Copy className="w-6 h-6" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white font-semibold leading-tight">
                  {translatedText}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center mt-8 pb-6">
          <p className="text-white/60 text-lg">
            Press ESC or click × to close
          </p>
        </div>
      </div>
    </div>
  );
}