
import TranslatorInterface from '@/components/TranslatorInterface';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Static background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50">
        {/* Static orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-6 sm:p-6">
        <div className="w-full max-w-sm sm:max-w-lg">
          <TranslatorInterface />
        </div>
      </div>
    </div>
  );
}
