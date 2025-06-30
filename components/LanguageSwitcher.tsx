'use client';

import { Button } from '@/components/ui/button';
import { TranslationDirection } from './TranslatorInterface';

interface LanguageSwitcherProps {
  direction: TranslationDirection;
  onDirectionChange: (direction: TranslationDirection) => void;
  disabled?: boolean;
}

type LanguagePair = 'en-vi' | 'ru-vi';

const LANGUAGE_PAIRS: Record<LanguagePair, {
  directions: [TranslationDirection, TranslationDirection];
  flag: string;
  label: string;
}> = {
  'en-vi': {
    directions: ['en-to-vi', 'vi-to-en'],
    flag: '🇺🇸',
    label: 'EN'
  },
  'ru-vi': {
    directions: ['ru-to-vi', 'vi-to-ru'],
    flag: '🇷🇺',
    label: 'RU'
  }
};

export default function LanguageSwitcher({ 
  direction, 
  onDirectionChange, 
  disabled = false 
}: LanguageSwitcherProps) {
  const getCurrentPair = (): LanguagePair => {
    if (direction === 'en-to-vi' || direction === 'vi-to-en') return 'en-vi';
    return 'ru-vi';
  };

  const currentPair = getCurrentPair();

  const handleClick = () => {
    if (disabled) return;
    
    // Toggle between language pairs
    const newPair: LanguagePair = currentPair === 'en-vi' ? 'ru-vi' : 'en-vi';
    
    // When switching pairs, maintain the same direction pattern if possible
    const isToVietnamese = direction.endsWith('-to-vi');
    const newDirection = isToVietnamese 
      ? LANGUAGE_PAIRS[newPair].directions[0]  // X-to-vi
      : LANGUAGE_PAIRS[newPair].directions[1]; // vi-to-X
    
    onDirectionChange(newDirection);
  };

  const { flag } = LANGUAGE_PAIRS[currentPair];

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      className="absolute top-2 left-2 z-50 p-3 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
      title={`Switch to ${currentPair === 'en-vi' ? 'Russian' : 'English'}`}
    >
      <span className="text-2xl">{flag}</span>
    </Button>
  );
}