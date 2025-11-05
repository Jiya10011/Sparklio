import { useState } from 'react';
import { generateContent } from '../services/geminiService';
import { generateImage } from '../services/imageService';
import LoadingAnimation from './LoadingAnimation';

function GeneratorForm({ onBack, onResultsGenerated }) {
  // State management
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [style, setStyle] = useState('minimal');
  const [youtubeType, setYoutubeType] = useState('short');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);

  // Trending topics suggestions
  const trendingTopics = [
    "AI productivity hacks",
    "Sustainable living tips",
    "Remote work setup",
    "Personal branding",
    "Fitness motivation"
  ];

  // Style descriptions
  const styleInfo = {
    minimal: { emoji: "🤍", desc: "Clean & simple" },
    bold: { emoji: "💪", desc: "High impact" },
    professional: { emoji: "💼", desc: "Corporate ready" },
    aesthetic: { emoji: "🌸", desc: "Pinterest-worthy" },
    vibrant: { emoji: "🎨", desc: "Colorful & energetic" }
  };

  // Platform info with colors
  const platformInfo = {
    instagram: { emoji: "📸", color: "from-pink-500 to-purple-500" },
    linkedin: { emoji: "💼", color: "from-blue-500 to-blue-600" },
    twitter: { emoji: "🐦", color: "from-blue-400 to-blue-500" },
    youtube: { emoji: "▶️", color: "from-red-500 to-red-600" }
  };

  // YouTube content types
  const youtubeTypes = [
    { id: 'short', label: 'Short', desc: '60s script' },
    { id: 'title', label: 'Video Title', desc: 'Catchy titles' },
    { id: 'description', label: 'Description', desc: 'SEO optimized' },
    { id: 'thumbnail', label: 'Thumbnail Idea', desc: 'Text concepts' }
  ];

  // Character counter
  const characterCount = topic.length;
  const maxCharacters = 100;

  // Handle content generation with MULTIPLE variations
  const handleGenerate = async () => {
    // Clear previous errors
    setError(null);

    // Input validation
    if (!topic.trim()) {
      setError('Please enter a topic! ✨');
      return;
    }

    if (topic.trim().length < 5) {
      setError('Topic too short - please add more details (at least 5 characters)');
      return;
    }

    if (topic.length > 100) {
      setError('Topic too long - please keep it under 100 characters');
      return;
    }

    setLoading(true);
    console.log('🚀 Starting content generation...');
    console.log(`Platform: ${platform}, Style: ${style}, Topic: "${topic}"`);

    try {
      // Generate 3 variations of content
      setLoadingMessage('🎯 Crafting viral hooks...');
      console.log('📝 Generating 3 content variations...');
      
      const contentVariations = await Promise.all([
        generateContent(topic, platform, style, youtubeType),
        generateContent(topic, platform, style, youtubeType),
        generateContent(topic, platform, style, youtubeType)
      ]);
      
      console.log('✅ All 3 variations generated');
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate image for the first variation
      setLoadingMessage('🎨 Generating image concepts...');
      console.log('🎨 Generating image...');
      
      const imageUrl = await generateImage(contentVariations[0].stylePrompt, topic);
      console.log('✅ Image generated:', imageUrl);
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Prepare final result with variations
      setLoadingMessage('✨ Finalizing your content...');
      
      const result = {
        variations: contentVariations.map((content, index) => ({
          ...content,
          id: `variation-${index + 1}`,
          variationNumber: index + 1
        })),
        imageUrl,
        topic,
        platform,
        style,
        youtubeType: platform === 'youtube' ? youtubeType : null,
        timestamp: new Date().toISOString(),
        id: `sparklio-${Date.now()}`
      };
      
      // Save to history
      saveToHistory(result);
      
      console.log('🎉 Generation complete!');
      console.log('Result with 3 variations:', result);
      
      // Show results
      if (onResultsGenerated) {
        onResultsGenerated(result);
      }
      
      setError(null);
      
    } catch (error) {
      console.error('❌ Generation failed:', error);
      setError(error.message || 'Generation failed - please try again');
      
    } finally {
      setLoading(false);
      setLoadingMessage('');
      console.log('✨ Generation process finished');
    }
  };

  // Save to localStorage history
  const saveToHistory = (result) => {
    try {
      const history = JSON.parse(localStorage.getItem('sparklio-history') || '[]');
      history.unshift(result);
      const trimmedHistory = history.slice(0, 10);
      localStorage.setItem('sparklio-history', JSON.stringify(trimmedHistory));
      console.log('💾 Saved to history');
    } catch (storageError) {
      console.warn('⚠️ Failed to save to history:', storageError);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* LOADING ANIMATION - SHOWS WHEN GENERATING */}
      {loading && <LoadingAnimation message={loadingMessage} />}

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-spark-orange/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-frame-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-gray-800 bg-dark-surface/50 backdrop-blur-md sticky top-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Home</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-spark-orange via-spark-pink to-frame-purple bg-clip-text text-transparent">
              SPARKLIO
            </h1>
          </div>
          <div className="w-32"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-spark-orange to-spark-pink flex items-center justify-center text-sm font-bold">1</div>
            <div className="w-16 h-1 bg-gradient-to-r from-spark-orange to-spark-pink"></div>
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600">2</div>
            <div className="w-16 h-1 bg-gray-800"></div>
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-600">3</div>
          </div>
          <p className="text-center text-sm text-gray-500">Tell us your idea → Choose style → Generate ✨</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 text-xl"
            >
              ×
            </button>
          </div>
        )}

        {/* Topic Input Card */}
        <div className="bg-gradient-to-br from-dark-surface/90 to-dark-surface/50 backdrop-blur-xl rounded-2xl p-8 mb-6 border border-spark-orange/20 shadow-2xl">
          <label className="block text-spark-orange text-sm font-semibold mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="text-xl">✨</span>
            What's Your Spark?
          </label>
          
          <div className="relative">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value.slice(0, maxCharacters))}
              onKeyPress={handleKeyPress}
              placeholder="Describe your content idea... (e.g., '10 sustainable fashion tips for beginners')"
              rows="3"
              className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-spark-orange focus:border-transparent transition-all resize-none"
              disabled={loading}
            />
            <div className="absolute bottom-3 right-3 text-xs">
              <span className={characterCount > maxCharacters * 0.9 ? 'text-spark-orange font-bold' : 'text-gray-500'}>
                {characterCount}/{maxCharacters}
              </span>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
              <span>🔥</span> Trending now:
            </p>
            <div className="flex gap-2 flex-wrap">
              {trendingTopics.map((trending, index) => (
                <button
                  key={index}
                  onClick={() => setTopic(trending)}
                  disabled={loading}
                  className="text-xs bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 hover:border-spark-orange/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {trending}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Selector */}
        <div className="bg-gradient-to-br from-dark-surface/90 to-dark-surface/50 backdrop-blur-xl rounded-2xl p-8 mb-6 border border-spark-orange/20 shadow-2xl">
          <label className="block text-spark-orange text-sm font-semibold mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="text-xl">📱</span>
            Choose Platform
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(platformInfo).map(([p, info]) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                disabled={loading}
                className={`relative group p-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  platform === p
                    ? 'bg-gradient-to-br ' + info.color + ' shadow-lg scale-105'
                    : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'
                }`}
              >
                <div className="text-4xl mb-2">{info.emoji}</div>
                <div className={`text-sm font-medium capitalize ${
                  platform === p ? 'text-white' : 'text-gray-300'
                }`}>
                  {p}
                </div>
                {platform === p && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* YouTube Content Type */}
        {platform === 'youtube' && (
          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 backdrop-blur-xl rounded-2xl p-8 mb-6 border border-red-500/30 shadow-2xl">
            <label className="block text-red-400 text-sm font-semibold mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="text-xl">▶️</span>
              YouTube Content Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {youtubeTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setYoutubeType(type.id)}
                  disabled={loading}
                  className={`p-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    youtubeType === type.id
                      ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg scale-105 border-2 border-white/20'
                      : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-red-500/30'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    youtubeType === type.id ? 'text-white' : 'text-gray-300'
                  }`}>
                    {type.label}
                  </div>
                  <div className={`text-xs ${
                    youtubeType === type.id ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {type.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Style Selector */}
        <div className="bg-gradient-to-br from-dark-surface/90 to-dark-surface/50 backdrop-blur-xl rounded-2xl p-8 mb-6 border border-spark-orange/20 shadow-2xl">
          <label className="block text-spark-orange text-sm font-semibold mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="text-xl">🎨</span>
            Select Style
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(styleInfo).map(([s, info]) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                disabled={loading}
                className={`group relative p-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  style === s
                    ? 'bg-gradient-to-br from-spark-orange to-spark-pink shadow-lg scale-105 border-2 border-white/20'
                    : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-spark-orange/30'
                }`}
              >
                <div className="text-3xl mb-2">{info.emoji}</div>
                <div className={`text-sm font-medium capitalize mb-1 ${
                  style === s ? 'text-white' : 'text-gray-300'
                }`}>
                  {s}
                </div>
                <div className={`text-xs ${
                  style === s ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {info.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="relative">
          <div className={`absolute -inset-1 bg-gradient-to-r from-spark-orange via-spark-pink to-frame-purple rounded-xl blur opacity-50 transition duration-1000 ${loading ? 'animate-pulse' : ''}`}></div>
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="relative w-full bg-gradient-to-r from-spark-orange via-spark-pink to-frame-purple text-white py-5 rounded-xl font-bold uppercase tracking-wide hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl flex items-center justify-center gap-3 text-lg"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Your Spark...</span>
              </>
            ) : (
              <>
                <span className="text-2xl animate-bounce">⚡</span>
                <span>Generate 3 Variations</span>
                <span className="text-2xl">✨</span>
              </>
            )}
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            AI powered • 3 variations per generation • Unlimited generations
          </p>
          <p className="text-gray-600 text-xs mt-2">
            💡 Tip: Press Enter to generate instantly
          </p>
        </div>
      </div>
    </div>
  );
}

export default GeneratorForm;