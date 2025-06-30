'use client';

import { Mic, Type } from 'lucide-react';

export type InputMode = 'voice' | 'text';

interface ModeToggleProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  disabled?: boolean;
}

export default function ModeToggle({ 
  mode, 
  onModeChange, 
  disabled = false 
}: ModeToggleProps) {
  const toggleMode = () => {
    onModeChange(mode === 'voice' ? 'text' : 'voice');
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1 shadow-inner">
        <button
          onClick={!disabled ? toggleMode : undefined}
          disabled={disabled}
          className={`flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
            mode === 'voice' 
              ? 'bg-white text-blue-700 shadow-lg' 
              : 'text-gray-600 hover:text-gray-800'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
        >
          <Mic className="hidden sm:block w-4 h-4" />
          <span className="hidden sm:inline">Voice</span>
          <span className="sm:hidden">🎤</span>
        </button>
        
        <button
          onClick={!disabled ? toggleMode : undefined}
          disabled={disabled}
          className={`flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
            mode === 'text' 
              ? 'bg-white text-blue-700 shadow-lg' 
              : 'text-gray-600 hover:text-gray-800'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
        >
          <Type className="hidden sm:block w-4 h-4" />
          <span className="hidden sm:inline">Type</span>
          <span className="sm:hidden">✏️</span>
        </button>
      </div>
    </div>
  );
}