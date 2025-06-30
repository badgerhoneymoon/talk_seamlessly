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
  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center bg-gradient-to-r from-purple-100/80 to-blue-100/80 backdrop-blur-sm rounded-xl p-1 shadow-inner">
        {/* Sliding background indicator */}
        <div 
          className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-lg shadow-md transition-transform duration-300 ease-out ${
            mode === 'voice' ? 'translate-x-0' : 'translate-x-full'
          }`}
        />
        
        <button
          onClick={() => !disabled && onModeChange('voice')}
          disabled={disabled}
          className={`relative z-10 flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
            mode === 'voice' 
              ? 'text-purple-700' 
              : 'text-gray-600 hover:text-gray-800'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
        >
          <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Voice</span>
        </button>
        
        <button
          onClick={() => !disabled && onModeChange('text')}
          disabled={disabled}
          className={`relative z-10 flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
            mode === 'text' 
              ? 'text-purple-700' 
              : 'text-gray-600 hover:text-gray-800'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
        >
          <Type className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Type</span>
        </button>
      </div>
    </div>
  );
}