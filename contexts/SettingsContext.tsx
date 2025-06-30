'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type TTSProvider = 'openai' | 'browser';
export type OpenAIVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

interface Settings {
  ttsProvider: TTSProvider;
  openaiVoice: OpenAIVoice;
  englishTtsSpeed: number;
  vietnameseTtsSpeed: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  ttsProvider: 'openai',
  openaiVoice: 'shimmer',
  englishTtsSpeed: 1.0,
  vietnameseTtsSpeed: 1.0,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('talk-seamlessly-settings');
      console.log('📱 Loading from localStorage:', stored);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        console.log('📋 Parsed settings:', parsedSettings);
        console.log('🔧 Default settings:', DEFAULT_SETTINGS);
        const finalSettings = { ...DEFAULT_SETTINGS, ...parsedSettings };
        console.log('✅ Final merged settings:', finalSettings);
        setSettings(finalSettings);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage when they change (but not on initial load)
  useEffect(() => {
    if (!isLoaded) return; // Don't save during initial load
    
    try {
      console.log('💾 Saving to localStorage:', settings);
      localStorage.setItem('talk-seamlessly-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings, isLoaded]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}