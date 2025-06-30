'use client';

import { Loader2, XCircle, Mic } from 'lucide-react';
import { Status, TranslationDirection } from './TranslatorInterface';

interface StatusIndicatorProps {
  status: Status;
  direction: TranslationDirection;
  error?: string;
}

export default function StatusIndicator({ 
  status, 
  direction, 
  error 
}: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          icon: null,
          text: `Ready to translate ${direction === 'en-to-vi' ? 'English to Vietnamese' : 'Vietnamese to English'}`,
          className: 'text-gray-600'
        };
      
      case 'recording':
        return {
          icon: <Mic className="w-4 h-4 animate-pulse" />,
          text: 'Recording audio...',
          className: 'text-red-600'
        };
      
      case 'processing':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Translating...',
          className: 'text-blue-600'
        };
      
      case 'success':
        return {
          icon: null,
          text: '',
          className: 'text-green-600'
        };
      
      case 'error':
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: error || 'Translation failed',
          className: 'text-red-600'
        };
      
      default:
        return {
          icon: null,
          text: '',
          className: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();

  if (status === 'idle' && !config.text) return null;
  if (status === 'success') return null;

  return (
    <div className="flex items-center justify-center py-4">
      <div className={`flex items-center space-x-3 px-6 py-3 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
        status === 'idle' ? 'bg-gray-100/50' :
        status === 'recording' ? 'bg-red-100/60 shadow-lg' :
        status === 'processing' ? 'bg-blue-100/60 shadow-lg' :
        'bg-red-100/60 shadow-lg'
      }`}>
        {config.icon && (
          <div className={`${config.className} transition-all duration-300`}>
            {config.icon}
          </div>
        )}
        
        <span className={`text-sm font-semibold ${config.className} transition-all duration-300`}>
          {config.text}
        </span>
        
        {status === 'recording' && (
          <div className="flex space-x-1.5 ml-2">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        
        {status === 'processing' && (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100" />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-200" />
          </div>
        )}
      </div>
    </div>
  );
}