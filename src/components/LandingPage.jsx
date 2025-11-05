import { Sparkles } from 'lucide-react';

function LandingPage({ onStartCreating }) {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-spark-orange/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-frame-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Animated Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Sparkles className="w-20 h-20 text-spark-orange animate-pulse" />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-spark-pink animate-bounce" />
            </div>
          </div>
        </div>

        {/* Logo */}
        <h1 className="text-7xl md:text-8xl font-black mb-4 bg-gradient-to-r from-spark-orange via-spark-pink to-frame-purple bg-clip-text text-transparent animate-gradient">
          SPARKLIO
        </h1>

        {/* Tagline */}
        <p className="text-spark-orange text-xl md:text-2xl font-semibold mb-8">
          Content That Sparks Engagement
        </p>

        {/* Description */}
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Transform your ideas into viral-worthy content in seconds. AI-powered visuals,
          scroll-stopping hooks, and engaging captions—all in one place.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
          <div className="bg-dark-surface/50 backdrop-blur border border-spark-orange/20 rounded-2xl p-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-spark-orange to-spark-pink bg-clip-text text-transparent mb-2">
              10K+
            </div>
            <div className="text-gray-400 text-sm">Posts Created</div>
          </div>
          <div className="bg-dark-surface/50 backdrop-blur border border-spark-pink/20 rounded-2xl p-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-spark-pink to-frame-purple bg-clip-text text-transparent mb-2">
              3 Sec
            </div>
            <div className="text-gray-400 text-sm">Avg. Generation</div>
          </div>
          <div className="bg-dark-surface/50 backdrop-blur border border-frame-purple/20 rounded-2xl p-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-frame-purple to-spark-orange bg-clip-text text-transparent mb-2">
              5x
            </div>
            <div className="text-gray-400 text-sm">Engagement Boost</div>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <span className="px-6 py-3 bg-dark-surface/50 border border-spark-orange/30 rounded-full text-spark-orange font-medium flex items-center gap-2">
            ⚡ AI Visuals
          </span>
          <span className="px-6 py-3 bg-dark-surface/50 border border-spark-pink/30 rounded-full text-spark-pink font-medium flex items-center gap-2">
            🎯 Viral Hooks
          </span>
          <span className="px-6 py-3 bg-dark-surface/50 border border-frame-purple/30 rounded-full text-frame-purple font-medium flex items-center gap-2">
            💬 Smart Captions
          </span>
          <span className="px-6 py-3 bg-dark-surface/50 border border-spark-orange/30 rounded-full text-spark-orange font-medium flex items-center gap-2">
            🔥 Trending Hashtags
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={onStartCreating}
          className="group relative px-12 py-5 bg-gradient-to-r from-spark-orange via-spark-pink to-frame-purple text-white text-xl font-bold rounded-2xl hover:shadow-2xl hover:shadow-spark-orange/50 transition-all duration-300 hover:scale-105"
        >
          <span className="flex items-center justify-center gap-3">
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            START CREATING FREE
            <span className="text-2xl">→</span>
          </span>
        </button>

        <p className="mt-6 text-gray-500 text-sm">
          No credit card required • Generate unlimited content
        </p>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-500 text-sm">
          <p>Made with 💙 by Sparklio</p>
          <p className="mt-2">Powered by Google Gemini AI</p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;