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
  const [isCopied, setIsCopied] = useState(false);
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

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
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
    
    if (settings.ttsProvider === 'openai') {
      const cacheKey = `${text}-${language}-${settings.openaiVoice}-${settings.ttsSpeed}`;
      
      if (audioCache[cacheKey]) {
        setIsPlayingAudio(true);
        const audio = new Audio(audioCache[cacheKey]);
        audio.play();
        
        audio.addEventListener('ended', () => setIsPlayingAudio(false));
        audio.addEventListener('error', () => setIsPlayingAudio(false));
      } else {
        setIsLoadingAudio(true);
        try {
          const response = await fetch('/api/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              language,
              voice: settings.openaiVoice,
              speed: settings.ttsSpeed,
            }),
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
          console.error('OpenAI TTS Error:', error);
          setIsLoadingAudio(false);
          playBrowserTTS(text, language);
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
    utterance.rate = settings.ttsSpeed;
    utterance.pitch = 1;
    
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  const targetLanguage = direction === 'en-to-vi' ? 'Vietnamese' : 'English';
  const sourceLanguage = direction === 'en-to-vi' ? 'English' : 'Vietnamese';

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
        title="Close (ESC)"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
            Translation Complete
          </h1>
          <p className="text-xl text-white/80">
            {sourceLanguage} → {targetLanguage}
          </p>
        </div>

        {/* Original Text */}
        {originalText && (
          <div className="w-full max-w-4xl mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white/90">
                  Original ({sourceLanguage})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakText(originalText, true)}
                  disabled={isLoadingAudio || isPlayingAudio}
                  className="p-2 text-white/80 hover:bg-white/20 rounded-xl transition-all duration-200"
                >
                  {isLoadingAudio ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-2xl sm:text-3xl text-white leading-relaxed">
                {originalText}
              </p>
            </div>
          </div>
        )}

        {/* Translated Text */}
        <div className="w-full max-w-4xl">
          <div className="bg-gradient-to-br from-green-400/20 to-emerald-400/20 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-green-400/30 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                Translation ({targetLanguage})
              </h2>
              <div className="flex space-x-3">
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
                  onClick={() => copyToClipboard(translatedText)}
                  className="p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
                >
                  {isCopied ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Copy className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-4xl sm:text-5xl lg:text-6xl text-white font-medium leading-tight">
              {translatedText}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-white/60 mt-8 text-lg">
          Press ESC or click × to close
        </p>
      </div>
    </div>
  );
}