'use client';

import { TranslationDirection } from './TranslatorInterface';

interface LanguageToggleProps {
  direction: TranslationDirection;
  onDirectionChange: (direction: TranslationDirection) => void;
  disabled?: boolean;
}

type LanguagePair = 'en-vi' | 'ru-vi';

const LANGUAGE_PAIRS: Record<LanguagePair, {
  label: string;
  directions: [TranslationDirection, TranslationDirection];
  languages: [{ flag: string; name: string; short: string }, { flag: string; name: string; short: string }];
}> = {
  'en-vi': {
    label: 'English ↔ Vietnamese',
    directions: ['en-to-vi', 'vi-to-en'],
    languages: [
      { flag: '🇺🇸', name: 'English', short: 'EN' },
      { flag: '🇻🇳', name: 'Vietnamese', short: 'VI' }
    ]
  },
  'ru-vi': {
    label: 'Russian ↔ Vietnamese',
    directions: ['ru-to-vi', 'vi-to-ru'],
    languages: [
      { flag: '🇷🇺', name: 'Russian', short: 'RU' },
      { flag: '🇻🇳', name: 'Vietnamese', short: 'VI' }
    ]
  }
};

export default function LanguageToggle({ 
  direction, 
  onDirectionChange, 
  disabled = false 
}: LanguageToggleProps) {
  // Determine current language pair
  const getCurrentPair = (): LanguagePair => {
    if (direction === 'en-to-vi' || direction === 'vi-to-en') return 'en-vi';
    if (direction === 'ru-to-vi' || direction === 'vi-to-ru') return 'ru-vi';
    return 'en-vi'; // fallback
  };

  const currentPair = getCurrentPair();

  const toggleDirection = () => {
    const pair = LANGUAGE_PAIRS[currentPair];
    const currentIndex = pair.directions.indexOf(direction);
    const newDirection = pair.directions[1 - currentIndex]; // Toggle between 0 and 1
    onDirectionChange(newDirection);
  };

  const switchLanguagePair = (clickedLanguageIndex: number) => {
    const clickedLanguage = pair.languages[clickedLanguageIndex];
    
    // If clicking on the currently active language
    if ((isFirstDirection && clickedLanguageIndex === 0) || (!isFirstDirection && clickedLanguageIndex === 1)) {
      // Only switch language pairs if the clicked language is NOT Vietnamese
      if (clickedLanguage.short !== 'VI') {
        const newPair: LanguagePair = currentPair === 'en-vi' ? 'ru-vi' : 'en-vi';
        
        // Maintain the same direction pattern when switching pairs
        const isToVietnamese = direction.endsWith('-to-vi');
        const newDirection = isToVietnamese 
          ? LANGUAGE_PAIRS[newPair].directions[0]  // X-to-vi
          : LANGUAGE_PAIRS[newPair].directions[1]; // vi-to-X
        
        onDirectionChange(newDirection);
      }
      // If clicking on Vietnamese twice, do nothing (no pair switch)
    } else {
      // Otherwise, just toggle direction
      toggleDirection();
    }
  };

  const pair = LANGUAGE_PAIRS[currentPair];
  const currentLangIndex = pair.directions.indexOf(direction);
  const isFirstDirection = currentLangIndex === 0;

  return (
    <div className="relative flex items-center bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1 shadow-inner">
      <button
        onClick={!disabled ? () => switchLanguagePair(0) : undefined}
        disabled={disabled}
        className={`flex items-center justify-center space-x-1 sm:space-x-2 px-6 py-4 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-lg sm:text-base ${
          isFirstDirection
            ? 'bg-white text-blue-700 shadow-lg' 
            : 'text-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="text-2xl sm:text-xl">{pair.languages[0].flag}</span>
        <span className="hidden sm:inline">{pair.languages[0].name}</span>
        <span className="sm:hidden">{pair.languages[0].short}</span>
      </button>
      
      <button
        onClick={!disabled ? () => switchLanguagePair(1) : undefined}
        disabled={disabled}
        className={`flex items-center justify-center space-x-1 sm:space-x-2 px-6 py-4 sm:px-6 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-lg sm:text-base ${
          !isFirstDirection
            ? 'bg-white text-blue-700 shadow-lg' 
            : 'text-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="text-2xl sm:text-xl">{pair.languages[1].flag}</span>
        <span className="hidden sm:inline">{pair.languages[1].name}</span>
        <span className="sm:hidden">{pair.languages[1].short}</span>
      </button>
    </div>
  );
}