import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { googleProvider } from '../config/firebase';
import { generateContent } from '../services/geminiService';
import { generateImage } from '../services/imageService';
import { getUserApiKey } from '../services/userApiKeyService';
import ApiKeySetupModal from './ApiKeySetupModal';
import { LogIn, LogOut, Menu, History, ChevronDown, X, User, Lightbulb } from 'lucide-react';
import ContentTemplates from './ContentTemplates';
import { TrendingUp } from 'lucide-react';

function GeneratorForm({ 
  onBack, 
  onResultsGenerated, 
  onViewHistory,
  onOpenDashboard,     // NEW
  dailyApiUsage,       // NEW
  incrementApiUsage    // NEW
}) { 
  
  // State management
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [style, setStyle] = useState('minimal');
  const [youtubeType, setYoutubeType] = useState('short');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);
  const [numVariations, setNumVariations] = useState(3); 

  // User & API Key state
  const [user, setUser] = useState(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Trending topics
  const trendingTopics = [
    "AI productivity hacks",
    "Sustainable living tips",
    "Remote work setup",
    "Personal branding",
    "Fitness motivation"
  ];

  // Style info
  const styleInfo = {
    minimal: { emoji: "🤍", desc: "Clean & simple" },
    bold: { emoji: "💪", desc: "High impact" },
    professional: { emoji: "💼", desc: "Corporate ready" },
    aesthetic: { emoji: "🌸", desc: "Pinterest-worthy" },
    vibrant: { emoji: "🎨", desc: "Colorful & energetic" }
  };

  // Platform info
  const platformInfo = {
    instagram: { emoji: "📸", color: "from-pink-500 to-purple-500" },
    linkedin: { emoji: "💼", color: "from-blue-500 to-blue-600" },
    twitter: { emoji: "🐦", color: "from-blue-400 to-blue-500" },
    youtube: { emoji: "▶️", color: "from-red-500 to-red-600" }
  };

  // YouTube types
  const youtubeTypes = [
    { id: 'short', label: 'Short', desc: '60s script' },
    { id: 'title', label: 'Video Title', desc: 'Catchy titles' },
    { id: 'description', label: 'Description', desc: 'SEO optimized' },
    { id: 'thumbnail', label: 'Thumbnail Idea', desc: 'Text concepts' }
  ];

  // Character counter - 1000 characters
  const characterCount = topic.length;
  const maxCharacters = 1000;
  
  // API Cost Calculation
  const apiCost = numVariations * 5; // 5 requests per variation

  // Check auth & API key on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);

      if (currentUser) {
        console.log('✅ User logged in:', currentUser.uid);
        const keyResult = await getUserApiKey(currentUser.uid);
        setHasApiKey(keyResult.success);
        console.log('🔑 Has API key:', keyResult.success);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      console.log('🔐 Starting Google sign in...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Signed in:', result.user.uid);
      
      const keyResult = await getUserApiKey(result.user.uid);
      setHasApiKey(keyResult.success);
      
      if (!keyResult.success) {
        setShowApiKeyModal(true);
      }
    } catch (error) {
      console.error('❌ Sign in error:', error);
      setError('Failed to sign in. Please try again.');
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      setShowUserMenu(false);
      await signOut(auth);
      setUser(null);
      setHasApiKey(false);
      console.log('👋 Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  // Handle View History
  const handleViewHistory = () => {
    setShowUserMenu(false);
    if (onViewHistory) {
      onViewHistory();
    }
  };

  // Handle content generation with DYNAMIC variations
  const handleGenerate = async () => {
    setError(null);

    if (!user) {
      setError('Please sign in to generate content');
      return;
    }

    if (!topic.trim()) {
      setError('Please enter a topic! ✨');
      return;
    }

    if (topic.trim().length < 5) {
      setError('Topic too short - add more details (at least 5 characters)');
      return;
    }

    if (topic.length > maxCharacters) {
      setError(`Topic too long - keep it under ${maxCharacters} characters`);
      return;
    }

    setLoading(true);
    console.log(`🚀 Starting generation with ${numVariations} variations...`);

    try {
      // Generate dynamic number of variations
      setLoadingMessage(`🎯 Crafting ${numVariations} viral variation${numVariations > 1 ? 's' : ''}...`);
      console.log(`📝 Step 1: Generating ${numVariations} content variations...`);

      const variationPromises = [];
      for (let i = 0; i < numVariations; i++) {
        variationPromises.push(
          generateContent(topic, platform, style, youtubeType, user.uid)
        );
      }

      const contentVariations = await Promise.all(variationPromises);
      console.log(`✅ All ${numVariations} variations generated`);
      await new Promise(resolve => setTimeout(resolve, 500));

      setLoadingMessage('🎨 Generating image concepts...');
      console.log('🎨 Step 2: Generating image...');

      const imageUrl = await generateImage(contentVariations[0].stylePrompt, topic);
      console.log('✅ Image generated:', imageUrl);
      await new Promise(resolve => setTimeout(resolve, 500));

      setLoadingMessage('✨ Finalizing your content...');

      // Call this *before* saving to history or showing results
      if (incrementApiUsage) {
        incrementApiUsage(apiCost);
        console.log(`📊 API usage incremented by: ${apiCost}`);
      }
      
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

      saveToHistory(result);
      console.log('🎉 Generation complete!');

      if (onResultsGenerated) {
        onResultsGenerated(result);
      }

      setError(null);

    } catch (error) {
      console.error('❌ Generation failed:', error);
      
      if (error.message === 'NEED_API_KEY') {
        setShowApiKeyModal(true);
        setError('Please add your Gemini API key to continue');
        // Do not increment usage if it failed
        return; 
      }

      setError(error.message || 'Generation failed - please try again');

    } finally {
      setLoading(false);
      setLoadingMessage('');
      console.log('✨ Generation process finished');
    }
  };

  // Save to history
  const saveToHistory = (result) => {
    try {
      const history = JSON.parse(localStorage.getItem('sparklio-history') || '[]');
      history.unshift(result);
      localStorage.setItem('sparklio-history', JSON.stringify(history.slice(0, 20)));
      console.log('💾 Saved to history');
    } catch (err) {
      console.warn('⚠️ Failed to save history:', err);
    }
  };

  // Handle API key modal success
  const handleApiKeySuccess = () => {
    setHasApiKey(true);
    setShowApiKeyModal(false);
    setError(null);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Animated Background */}
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
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-spark-orange via-spark-pink to-frame-purple bg-clip-text text-transparent">
              SPARKLIO
            </h1>
          </div>
        
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={onOpenDashboard}
                  className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-all text-sm"
                  title="View API Usage Dashboard"
                >
                  <TrendingUp className="w-4 h-4 text-spark-orange" />
                  <span className="text-white font-medium">
                    {dailyApiUsage}
                  </span>
                  <span className="text-gray-500">
                    / 1400
                  </span>
                </button>

                <button
                  onClick={() => setShowUserMenu(true)}
                  className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-all"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-spark-orange"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                  <Menu className="w-4 h-4 text-gray-400" />
                </button>
              </>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-2 bg-spark-orange hover:bg-spark-pink px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Menu Sidebar */}
      {showUserMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={() => setShowUserMenu(false)}
          ></div>

          <div className="fixed top-0 right-0 h-full w-80 bg-gray-900 shadow-2xl z-[9999] animate-slide-in-right border-l border-gray-700">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Account</h3>
              <button
                onClick={() => setShowUserMenu(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 border-b border-gray-700">
              <div className="flex items-start gap-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-spark-orange"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-lg truncate">{user.displayName || 'User'}</p>
                  <p className="text-gray-400 text-sm truncate">{user.email}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">API Key Status</span>
                  {hasApiKey ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-sm text-green-400 font-medium">Connected</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowApiKeyModal(true);
                        setShowUserMenu(false);
                      }}
                      className="text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium"
                    >
                      Add Key →
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4">
              <button
                onClick={handleViewHistory}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-800 rounded-xl transition-all text-left group"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <History className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">View History</p>
                  <p className="text-gray-400 text-xs">See your past generations</p>
                </div>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-red-500/10 rounded-xl transition-all text-left group mt-2"
              >
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                  <LogOut className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-red-400 font-medium">Sign Out</p>
                  <p className="text-gray-400 text-xs">Logout from your account</p>
                </div>
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
              <p className="text-xs text-gray-500 text-center">
                Sparklio v1.0 • Made with ✨
              </p>
            </div>
          </div>
        </>
      )}

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

        {/* Sign In Prompt */}
        {!user && !checkingAuth && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">🔐</div>
            <h3 className="text-xl font-bold text-white mb-2">Sign In to Generate</h3>
            <p className="text-gray-400 mb-4">
              Sign in with Google to use Sparklio and get unlimited generations with your own API key
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="bg-gradient-to-r from-spark-orange to-spark-pink px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform inline-flex items-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Sign In with Google
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
              placeholder="Describe your content idea in detail... (up to 1000 characters - write as much as you need!)"
              rows="8"
              className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-spark-orange focus:border-transparent transition-all resize-none"
              disabled={loading || !user}
            />
            <div className="absolute bottom-3 right-3 text-xs">
              <span className={characterCount > maxCharacters * 0.9 ? 'text-spark-orange font-bold' : 'text-gray-500'}>
                {characterCount}/{maxCharacters}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: More detail = better results! Include your target audience, tone, key points, and call-to-action.
          </p>

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
                  disabled={loading || !user}
                  className="text-xs bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 hover:border-spark-orange/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {trending}
                </button>
              ))}
            </div>
          </div>

          {/* Browse Templates Button */}
          <button
            onClick={() => setShowTemplates(true)}
            disabled={loading || !user}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-500/30 text-purple-300 py-3 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lightbulb className="w-5 h-5" />
            <span>Browse Content Templates</span>
            <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full">45+ Ideas</span>
          </button>
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

        {/* Number of Variations Selector */}
        <div className="bg-gradient-to-br from-dark-surface/90 to-dark-surface/50 backdrop-blur-xl rounded-2xl p-8 mb-6 border border-spark-orange/20 shadow-2xl">
          <label className="block text-spark-orange text-sm font-semibold mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="text-xl">🎲</span>
            Number of Variations
          </label>

          <div className="space-y-6">
            {/* Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">How many variations do you want?</span>
                <span className="text-white font-bold text-2xl">{numVariations}</span>
              </div>
              
              <input
                type="range"
                min="1"
                max="10"
                value={numVariations}
                onChange={(e) => setNumVariations(parseInt(e.target.value))}
                disabled={loading}
                className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer
                          disabled:opacity-50 disabled:cursor-not-allowed
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-6
                          [&::-webkit-slider-thumb]:h-6
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-gradient-to-r
                          [&::-webkit-slider-thumb]:from-spark-orange
                          [&::-webkit-slider-thumb]:to-spark-pink
                          [&::-webkit-slider-thumb]:cursor-pointer
                          [&::-webkit-slider-thumb]:shadow-lg
                          [&::-webkit-slider-thumb]:hover:scale-110
                          [&::-webkit-slider-thumb]:transition-transform
                          [&::-moz-range-thumb]:w-6
                          [&::-moz-range-thumb]:h-6
                          [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:bg-gradient-to-r
                          [&::-moz-range-thumb]:from-spark-orange
                          [&::-moz-range-thumb]:to-spark-pink
                          [&::-moz-range-thumb]:border-0
                          [&::-moz-range-thumb]:cursor-pointer
                          [&::-moz-range-thumb]:shadow-lg"
              />
              
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-5 gap-2">
              {[1, 3, 5, 7, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumVariations(num)}
                  disabled={loading}
                  className={`p-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    numVariations === num
                      ? 'bg-gradient-to-r from-spark-orange to-spark-pink text-white shadow-lg scale-105'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <p className="text-blue-300 text-sm font-medium mb-1">
                    API Cost: {apiCost} requests
                  </p>
                  <p className="text-blue-200 text-xs">
                    Each variation uses ~5 API requests. Choose wisely based on your daily limit!
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className={`p-3 rounded-lg border ${
                numVariations <= 3 
                  ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                  : 'bg-gray-800/30 border-gray-700 text-gray-500'
              }`}>
                <p className="font-medium mb-1">1-3 variations</p>
                <p>Quick & efficient</p>
              </div>
              <div className={`p-3 rounded-lg border ${
                numVariations >= 4 && numVariations <= 6
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' 
                  : 'bg-gray-800/30 border-gray-700 text-gray-500'
              }`}>
                <p className="font-medium mb-1">4-6 variations</p>
                <p>Balanced choice</p>
              </div>
              <div className={`p-3 rounded-lg border ${
                numVariations >= 7
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-300' 
                  : 'bg-gray-800/30 border-gray-700 text-gray-500'
              }`}>
                <p className="font-medium mb-1">7-10 variations</p>
                <p>Maximum options</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="relative">
          <div className={`absolute -inset-1 bg-gradient-to-r from-spark-orange via-spark-pink to-frame-purple rounded-xl blur opacity-50 transition duration-1000 ${loading ? 'animate-pulse' : ''}`}></div>
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim() || !user}
            className="relative w-full bg-gradient-to-r from-spark-orange via-spark-pink to-frame-purple text-white py-5 rounded-xl font-bold uppercase tracking-wide hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl flex items-center justify-center gap-3 text-lg"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{loadingMessage || 'Creating...'}</span>
              </>
            ) : (
              <>
                <span className="text-2xl animate-bounce">⚡</span>
                <span>Generate {numVariations} Variation{numVariations > 1 ? 's' : ''}</span>
                <span className="text-2xl">✨</span>
              </>
            )}
          </button>
        </div>

        {/* Info Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {user && hasApiKey ? (
              'Using your personal API key • Unlimited generations'
            ) : user ? (
              'Add API key for unlimited generations'
            ) : (
              'Sign in to start generating'
            )}
          </p>
          <p className="text-gray-600 text-xs mt-2">
            💡 Up to 1000 characters (≈150-200 words) • Press Enter to generate • {numVariations} variation{numVariations > 1 ? 's' : ''} per generation
          </p>
        </div>
      </div>

      {/* API Key Setup Modal */}
      <ApiKeySetupModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        userId={user?.uid}
        onSuccess={handleApiKeySuccess}
      />

      {/* Content Templates Modal */}
      {showTemplates && (
        <ContentTemplates
          onSelectTemplate={(prompt) => setTopic(prompt)}
          onClose={() => setShowTemplates(false)}
        />
      )}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default GeneratorForm;