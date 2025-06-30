'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface TextInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isProcessing?: boolean;
}

export default function TextInput({ 
  onSubmit, 
  disabled = false,
  placeholder = "Type your text to translate...",
  isProcessing = false
}: TextInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim() && !disabled) {
      onSubmit(text.trim());
      setText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[120px] sm:min-h-[120px] resize-none bg-white/80 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl px-5 py-4 sm:px-6 sm:py-4 text-base sm:text-base focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-300 placeholder:text-gray-400 shadow-sm"
          rows={3}
        />
        
        {/* Character count indicator */}
        <div className="absolute bottom-4 right-5 text-sm text-gray-400">
          {text.length > 0 && `${text.length} characters`}
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={disabled || !text.trim() || isProcessing}
          className={`relative flex items-center space-x-2 sm:space-x-3 px-8 py-4 sm:px-8 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform text-base sm:text-base ${
            disabled || !text.trim() || isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-5 h-5 sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 sm:w-5 sm:h-5" />
          )}
          <span>{isProcessing ? 'Translating...' : 'Translate'}</span>
          
          {/* Subtle glow effect */}
          {!disabled && text.trim() && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur-md opacity-30 -z-10" />
          )}
        </Button>
      </div>
    </div>
  );
}