'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';

interface RecordButtonProps {
  onStart: () => void;
  onStop: (audioBlob: Blob) => void;
  disabled?: boolean;
  isRecording?: boolean;
  isProcessing?: boolean;
}

export default function RecordButton({ 
  onStart, 
  onStop, 
  disabled = false,
  isRecording = false,
  isProcessing = false
}: RecordButtonProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onStop(audioBlob);
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      onStart();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleClick = () => {
    if (disabled) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
      <div className="relative">
        {/* Outer glow ring */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isProcessing
            ? 'bg-gradient-to-r from-blue-400 to-purple-500 blur-lg scale-110'
            : isRecording
            ? 'bg-gradient-to-r from-red-400 to-pink-500 blur-lg scale-110'
            : 'bg-gradient-to-r from-blue-400 to-purple-500 blur-md scale-105 hover:scale-125'
        }`} style={isProcessing || isRecording ? { animation: 'pulse 2s ease-in-out infinite' } : {}} />
        
        {/* Middle ring */}
        <div className={`absolute inset-2 rounded-full transition-all duration-300 ${
          isProcessing
            ? 'bg-gradient-to-r from-blue-300 to-purple-400 blur-sm'
            : isRecording
            ? 'bg-gradient-to-r from-red-300 to-pink-400 blur-sm'
            : 'bg-gradient-to-r from-blue-300 to-purple-400 blur-sm hover:blur-lg'
        }`} style={isProcessing || isRecording ? { animation: 'pulse 2.5s ease-in-out infinite 0.5s' } : {}} />
        
        <Button
          className={`relative w-28 h-28 sm:w-24 sm:h-24 rounded-full transition-all duration-300 transform select-none shadow-2xl ${
            isProcessing
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 scale-110'
              : isRecording
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 scale-110'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 active:scale-95'
          } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={disabled || isProcessing}
          onClick={handleClick}
        >
          <div className="flex items-center justify-center">
            {isProcessing ? (
              <Loader2 className="w-10 h-10 sm:w-8 sm:h-8 text-white drop-shadow-lg animate-spin" />
            ) : isRecording ? (
              <Square className="w-10 h-10 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
            ) : (
              <Mic className="w-10 h-10 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
            )}
          </div>
          
          {/* Recording pulse rings */}
          {isRecording && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-white/30" style={{ animation: 'ping 3s ease-in-out infinite' }} />
              <div className="absolute inset-0 rounded-full border border-white/20" style={{ animation: 'ping 3.5s ease-in-out infinite 0.8s' }} />
              <div className="absolute inset-0 rounded-full border border-white/10" style={{ animation: 'ping 4s ease-in-out infinite 1.2s' }} />
            </>
          )}
        </Button>
      </div>

      <div className="text-center space-y-1">
        <p className={`text-lg sm:text-base font-semibold transition-colors duration-300 ${
          isProcessing ? 'text-blue-600' : isRecording ? 'text-red-600' : 'text-gray-700'
        }`}>
          {isProcessing ? 'Translating...' : isRecording ? 'Recording...' : 'Ready to Record'}
        </p>
        <p className="text-sm sm:text-sm text-gray-500">
          {isProcessing ? 'Please wait while we process your audio' : isRecording ? 'Tap to stop and translate' : 'Tap the microphone to start'}
        </p>
      </div>
    </div>
  );
}