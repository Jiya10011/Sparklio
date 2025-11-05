import { Sparkles } from 'lucide-react';

export default function LoadingAnimation({ message }) {
  return (
    <div className="fixed inset-0 bg-dark-bg/98 backdrop-blur-xl z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Sparkles */}
        <div className="relative mb-8">
          <Sparkles className="w-24 h-24 text-spark-orange animate-pulse mx-auto" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 animate-bounce">
            <Sparkles className="w-12 h-12 text-spark-pink" />
          </div>
          <div className="absolute bottom-0 right-1/4 animate-ping">
            <Sparkles className="w-8 h-8 text-frame-purple" />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-4xl font-bold bg-gradient-to-r from-spark-orange via-spark-pink to-frame-purple bg-clip-text text-transparent mb-6 animate-pulse">
          Creating Your Spark...
        </h2>
        
        {/* Dynamic Loading Message */}
        {message && (
          <p className="text-2xl text-white font-semibold mb-8 animate-fade-in">
            {message}
          </p>
        )}

        {/* Loading Steps */}
        <div className="space-y-3 text-gray-400 text-lg mb-8">
          <p className="animate-fade-in flex items-center justify-center gap-2">
            <span className="text-2xl">🎯</span> Crafting 3 viral hooks...
          </p>
          <p className="animate-fade-in animation-delay-300 flex items-center justify-center gap-2">
            <span className="text-2xl">💬</span> Writing engaging captions...
          </p>
          <p className="animate-fade-in animation-delay-600 flex items-center justify-center gap-2">
            <span className="text-2xl">🔥</span> Finding trending hashtags...
          </p>
          <p className="animate-fade-in animation-delay-900 flex items-center justify-center gap-2">
            <span className="text-2xl">🎨</span> Generating stunning visuals...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-spark-orange via-spark-pink to-frame-purple animate-progress rounded-full"></div>
          </div>
        </div>

        <p className="mt-6 text-gray-500 text-sm animate-pulse">
          This usually takes 5-10 seconds...
        </p>
      </div>
    </div>
  );
}