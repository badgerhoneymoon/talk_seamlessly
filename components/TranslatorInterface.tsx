'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import LanguageToggle from './LanguageToggle';
import RecordButton from './RecordButton';
import TranslationOutput from './TranslationOutput';
import ModeToggle, { InputMode } from './ModeToggle';
import TextInput from './TextInput';
import SettingsButton from './SettingsButton';
import FullScreenModal from './FullScreenModal';

export type Language = 'vietnamese' | 'english';
export type TranslationDirection = 'vi-to-en' | 'en-to-vi';
export type Status = 'idle' | 'recording' | 'processing' | 'success' | 'error';

interface TranscriptionResult {
  originalText: string;
  translatedText: string;
}

export default function TranslatorInterface() {
  const [direction, setDirection] = useState<TranslationDirection>('en-to-vi');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string>('');
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [showFullScreen, setShowFullScreen] = useState(false);

  const handleDirectionChange = (newDirection: TranslationDirection) => {
    setDirection(newDirection);
    setResult(null);
    setError('');
  };

  const handleModeChange = (newMode: InputMode) => {
    setInputMode(newMode);
    setResult(null);
    setError('');
    setStatus('idle');
  };

  const handleRecordingStart = () => {
    setStatus('recording');
    setError('');
  };

  const handleRecordingStop = async (audioBlob: Blob) => {
    setStatus('processing');
    
    try {
      const transcriptionResult = await transcribeAndTranslate(audioBlob, direction);
      setResult(transcriptionResult);
      setStatus('success');
      setShowFullScreen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
      setStatus('error');
    }
  };

  const handleTextSubmit = async (text: string) => {
    setStatus('processing');
    setError('');
    
    try {
      const translationResult = await translateText(text, direction);
      setResult(translationResult);
      setStatus('success');
      setShowFullScreen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
      setStatus('error');
    }
  };

  const transcribeAndTranslate = async (audioBlob: Blob, direction: TranslationDirection): Promise<TranscriptionResult> => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('direction', direction);

    const response = await fetch('/api/transcribe-translate', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to transcribe audio');
    }

    const data = await response.json();
    return {
      originalText: data.originalText,
      translatedText: data.translatedText
    };
  };

  const translateText = async (text: string, direction: TranslationDirection): Promise<TranscriptionResult> => {
    const response = await fetch('/api/translate-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, direction }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to translate text');
    }

    const data = await response.json();
    return {
      originalText: data.originalText,
      translatedText: data.translatedText
    };
  };

  return (
    <div className="relative">
      {/* Background gradient blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl blur-xl opacity-60 -z-10 transform scale-110"></div>
      
      <Card className="relative p-4 sm:p-8 space-y-6 sm:space-y-8 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
        {/* Settings Button */}
        <SettingsButton />
        
        {/* Subtle static background pattern – allow clicks to pass through */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-full"></div>
        </div>

        <div className="relative z-10 space-y-6 sm:space-y-8">
          {/* Header section with enhanced typography */}
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-3xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Talk Seamlessly
            </h1>
            <p className="text-base sm:text-sm text-gray-500 font-medium">
              Vietnamese ↔ English Translation
            </p>
          </div>

          <LanguageToggle 
            direction={direction} 
            onDirectionChange={handleDirectionChange}
            disabled={status === 'recording' || status === 'processing'}
          />

          <ModeToggle
            mode={inputMode}
            onModeChange={handleModeChange}
            disabled={status === 'recording' || status === 'processing'}
          />
          
          <div className="space-y-4 sm:space-y-6">
            <div className="transition-all duration-500 ease-in-out">
              {inputMode === 'voice' ? (
                <RecordButton
                  onStart={handleRecordingStart}
                  onStop={handleRecordingStop}
                  disabled={status === 'processing'}
                  isRecording={status === 'recording'}
                  isProcessing={status === 'processing'}
                />
              ) : (
                <TextInput
                  onSubmit={handleTextSubmit}
                  disabled={status === 'processing'}
                  isProcessing={status === 'processing'}
                  placeholder={`Type in ${direction === 'en-to-vi' ? 'English' : 'Vietnamese'} to translate...`}
                />
              )}
            </div>
            
          </div>

          {(result || error) && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <TranslationOutput
                originalText={result?.originalText || ''}
                translatedText={result?.translatedText || ''}
                error={error}
                direction={direction}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Full Screen Modal */}
      <FullScreenModal
        isOpen={showFullScreen}
        onClose={() => setShowFullScreen(false)}
        originalText={result?.originalText || ''}
        translatedText={result?.translatedText || ''}
        direction={direction}
      />
    </div>
  );
}