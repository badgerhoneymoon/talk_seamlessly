'use client';

import { TranslationDirection } from './TranslatorInterface';

interface LanguageToggleProps {
  direction: TranslationDirection;
  onDirectionChange: (direction: TranslationDirection) => void;
  disabled?: boolean;
}

export default function LanguageToggle({ 
  direction, 
  onDirectionChange, 
  disabled = false 
}: LanguageToggleProps) {
  const isViToEn = direction === 'vi-to-en';

  const toggleDirection = () => {
    onDirectionChange(isViToEn ? 'en-to-vi' : 'vi-to-en');
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1 shadow-inner">
        <button
          onClick={!disabled ? toggleDirection : undefined}
          disabled={disabled}
          className={`flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
            !isViToEn 
              ? 'bg-white text-blue-700 shadow-lg' 
              : 'text-gray-600 hover:text-gray-800'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
        >
          <span className="text-base sm:text-xl">🇺🇸</span>
          <span className="hidden sm:inline">English</span>
          <span className="sm:hidden">EN</span>
        </button>
        
        <button
          onClick={!disabled ? toggleDirection : undefined}
          disabled={disabled}
          className={`flex items-center space-x-1 sm:space-x-2 px-3 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
            isViToEn 
              ? 'bg-white text-blue-700 shadow-lg' 
              : 'text-gray-600 hover:text-gray-800'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
        >
          <span className="text-base sm:text-xl">🇻🇳</span>
          <span className="hidden sm:inline">Vietnamese</span>
          <span className="sm:hidden">VI</span>
        </button>
      </div>
    </div>
  );
}