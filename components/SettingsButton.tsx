'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings, X } from 'lucide-react';
import { useSettings, TTSProvider, OpenAIVoice } from '@/contexts/SettingsContext';

export default function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting } = useSettings();

  const handleTTSChange = (provider: TTSProvider) => {
    updateSetting('ttsProvider', provider);
  };

  const handleVoiceChange = (voice: OpenAIVoice) => {
    console.log('🎭 Changing voice to:', voice);
    updateSetting('openaiVoice', voice);
    console.log('✅ Voice updated, new settings:', { ...settings, openaiVoice: voice });
  };

  const handleSpeedChange = (speed: number) => {
    updateSetting('ttsSpeed', speed);
  };

  const voiceOptions: { value: OpenAIVoice; label: string; description: string }[] = [
    { value: 'alloy', label: 'Alloy', description: 'Neutral, balanced' },
    { value: 'echo', label: 'Echo', description: 'Deep, resonant' },
    { value: 'fable', label: 'Fable', description: 'Warm, storytelling' },
    { value: 'nova', label: 'Nova', description: 'Energetic, youthful' },
    { value: 'onyx', label: 'Onyx', description: 'Professional, authoritative' },
    { value: 'shimmer', label: 'Shimmer', description: 'Bright, cheerful' },
  ];


  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 p-3 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
        title="Settings"
      >
        <Settings className="w-6 h-6 text-purple-600" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/20 backdrop-blur-sm">
      <div className="flex min-h-full items-start sm:items-center justify-center p-4 pt-8 sm:pt-20">
        <Card className="w-full max-w-md p-4 sm:p-6 bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Settings</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-purple-50 rounded-lg"
            >
              <X className="w-4 h-4 text-purple-600" />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-base sm:text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Text-to-Speech</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors">
                  <input
                    type="radio"
                    name="tts"
                    checked={settings.ttsProvider === 'browser'}
                    onChange={() => handleTTSChange('browser')}
                    className="w-5 h-5 text-purple-600 accent-purple-600"
                  />
                  <div>
                    <span className="text-base sm:text-sm font-medium text-gray-800">Browser TTS</span>
                    <p className="text-sm sm:text-xs text-gray-500">Fast, device voices</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors">
                  <input
                    type="radio"
                    name="tts"
                    checked={settings.ttsProvider === 'openai'}
                    onChange={() => handleTTSChange('openai')}
                    className="w-5 h-5 text-purple-600 accent-purple-600"
                  />
                  <div>
                    <span className="text-base sm:text-sm font-medium text-gray-800">OpenAI TTS</span>
                    <p className="text-sm sm:text-xs text-gray-500">High quality, slower</p>
                  </div>
                </label>
              </div>
            </div>

            {settings.ttsProvider === 'openai' && (
              <div>
                <h4 className="text-base sm:text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">OpenAI Voice</h4>
                <div className="space-y-2">
                  {voiceOptions.map((voice) => (
                    <label key={voice.value} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors">
                      <input
                        type="radio"
                        name="voice"
                        checked={settings.openaiVoice === voice.value}
                        onChange={() => handleVoiceChange(voice.value)}
                        className="w-5 h-5 text-purple-600 accent-purple-600"
                      />
                      <div>
                        <span className="text-base sm:text-sm font-medium text-gray-800">{voice.label}</span>
                        <p className="text-sm sm:text-xs text-gray-500">{voice.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <h4 className="text-base sm:text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Speech Speed</h4>
            <div className="space-y-3">
              <div className="px-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Speed: {settings.ttsSpeed}x</span>
                  <div className="flex space-x-1 text-xs text-gray-400">
                    <span>Slow</span>
                    <span>•</span>
                    <span>Fast</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.1"
                  value={settings.ttsSpeed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(168 85 247) ${((settings.ttsSpeed - 0.5) / 0.5) * 100}%, rgb(229 231 235) ${((settings.ttsSpeed - 0.5) / 0.5) * 100}%, rgb(229 231 235) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0.5x</span>
                  <span>0.6x</span>
                  <span>0.7x</span>
                  <span>0.8x</span>
                  <span>0.9x</span>
                  <span>1.0x</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}