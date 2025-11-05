import { useState, useEffect } from 'react';
import {
  Copy,
  Download,
  Share2,
  RefreshCw,
  Heart,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

function ResultsDisplay({ result, onGenerateNew, onBack }) {
  const [copiedItem, setCopiedItem] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [savedToFavorites, setSavedToFavorites] = useState(false);
  const [currentVariation, setCurrentVariation] = useState(0);

  const totalVariations = result.variations?.length || 1;
  const activeContent = result.variations?.[currentVariation] || result.variations?.[0];

  // Smooth entrance animation
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Copy to clipboard
  const copyToClipboard = async (text, itemName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemName);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy. Please try again.');
    }
  };

  // Copy all content from current variation
  const copyAllContent = () => {
    const allText = `${activeContent.hook}\n\n${activeContent.caption}\n\n${activeContent.hashtags
      .map(tag => `#${tag}`)
      .join(' ')}`;
    copyToClipboard(allText, 'all');
  };

  // Download image
  const handleDownloadImage = async () => {
    try {
      const link = document.createElement('a');
      link.href = result.imageUrl;
      link.download = `sparklio-${result.platform}-${Date.now()}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(result.imageUrl, '_blank');
    }
  };

  // Share content
  const handleShare = async () => {
    const shareText = `${activeContent.hook}\n\n${activeContent.caption}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Sparklio Content',
          text: shareText
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyToClipboard(shareText, 'share');
    }
  };

  // Save to favorites
  const saveToFavorites = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem('sparklio-favorites') || '[]');
      favorites.unshift(result);
      localStorage.setItem('sparklio-favorites', JSON.stringify(favorites.slice(0, 20)));
      setSavedToFavorites(true);
      setTimeout(() => setSavedToFavorites(false), 2000);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  // Navigate variations
  const nextVariation = () => {
    setCurrentVariation(prev => (prev + 1) % totalVariations);
  };

  const prevVariation = () => {
    setCurrentVariation(prev => (prev - 1 + totalVariations) % totalVariations);
  };

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-spark-orange/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-frame-purple/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-spark-pink/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-gray-800 bg-dark-surface/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-spark-orange animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-spark-orange via-spark-pink to-frame-purple bg-clip-text text-transparent">
              SPARKLIO
            </h1>
          </div>

          <button
            onClick={onGenerateNew}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-spark-orange to-spark-pink rounded-xl text-white font-medium hover:scale-105 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">New Content</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 max-w-6xl mx-auto px-4 py-8 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Success Banner */}
        <div className="mb-8 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 border border-green-500/30 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">✨ {totalVariations} Variations Generated!</h2>
            <p className="text-green-200 text-sm">
              Your viral-worthy {result.platform} posts are ready to shine
            </p>
          </div>
        </div>

        {/* Variation Selector */}
        {totalVariations > 1 && (
          <div className="mb-6 bg-gradient-to-br from-dark-surface/90 to-dark-surface/50 backdrop-blur-xl rounded-2xl p-6 border border-spark-orange/20 shadow-2xl">
            <div className="flex items-center justify-between">
              <button
                onClick={prevVariation}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all disabled:opacity-50"
                disabled={currentVariation === 0}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <div className="flex-1 text-center">
                <p className="text-gray-400 text-sm mb-2">Choose Your Favorite</p>
                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: totalVariations }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentVariation(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentVariation === index
                          ? 'bg-gradient-to-r from-spark-orange to-spark-pink w-8'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-white font-bold text-xl mt-2">
                  Variation {currentVariation + 1} of {totalVariations}
                </p>
              </div>

              <button
                onClick={nextVariation}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all disabled:opacity-50"
                disabled={currentVariation === totalVariations - 1}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions Bar */}
        <div className="mb-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={copyAllContent}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all font-medium shadow-lg"
          >
            {copiedItem === 'all' ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copy All Content</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-all font-medium shadow-lg"
          >
            <Download className="w-5 h-5" />
            <span>Download Image</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:scale-105 transition-all font-medium shadow-lg"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>

          <button
            onClick={saveToFavorites}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl hover:scale-105 transition-all font-medium shadow-lg ${
              savedToFavorites
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Heart className={`w-5 h-5 ${savedToFavorites ? 'fill-current' : ''}`} />
            <span>{savedToFavorites ? 'Saved!' : 'Save'}</span>
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Image */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-dark-surface/90 to-dark-surface/50 backdrop-blur-xl rounded-2xl p-6 border border-spark-orange/20 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🎨</span>
                  Visual
                </h3>
                <span className="px-3 py-1 bg-spark-orange/20 text-spark-orange rounded-full text-xs font-medium uppercase">
                  {result.platform}
                </span>
              </div>

              <div className="relative group">
                <img
                  src={result.imageUrl}
                  alt="Generated content visual"
                  className="w-full rounded-xl shadow-2xl"
                  loading="eager"
                  onError={e => {
                    console.error('Image failed to load:', result.imageUrl);
                    e.target.src = `https://placehold.co/1080x1080/FF6B35/FFFFFF?text=${encodeURIComponent(
                      result.topic
                    )}`;
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <button
                    onClick={handleDownloadImage}
                    className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="bg-gradient-to-br from-dark-surface/90 to-dark-surface/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Content Details
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Platform:</span>
                  <span className="text-white font-medium capitalize">{result.platform}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Style:</span>
                  <span className="text-white font-medium capitalize">{result.style}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Topic:</span>
                  <span className="text-white font-medium text-right">{result.topic}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Variations:</span>
                  <span className="text-white font-medium">{totalVariations} options</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Generated:</span>
                  <span className="text-white font-medium">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Text Content */}
          <div className="space-y-6">
            {/* Hook */}
            <div className="bg-gradient-to-br from-spark-orange/20 to-spark-orange/5 backdrop-blur-xl rounded-2xl p-6 border border-spark-orange/30 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Viral Hook
                </h3>
                <button
                  onClick={() => copyToClipboard(activeContent.hook, 'hook')}
                  className="px-3 py-1.5 bg-spark-orange/20 hover:bg-spark-orange/30 text-spark-orange rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                >
                  {copiedItem === 'hook' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-white text-lg leading-relaxed font-medium">{activeContent.hook}</p>
            </div>

            {/* Caption */}
            <div className="bg-gradient-to-br from-spark-pink/20 to-spark-pink/5 backdrop-blur-xl rounded-2xl p-6 border border-spark-pink/30 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  Caption
                </h3>
                <button
                  onClick={() => copyToClipboard(activeContent.caption, 'caption')}
                  className="px-3 py-1.5 bg-spark-pink/20 hover:bg-spark-pink/30 text-spark-pink rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                >
                  {copiedItem === 'caption' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="text-white leading-relaxed whitespace-pre-wrap">{activeContent.caption}</p>
            </div>

            {/* Hashtags */}
            <div className="bg-gradient-to-br from-frame-purple/20 to-frame-purple/5 backdrop-blur-xl rounded-2xl p-6 border border-frame-purple/30 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  Hashtags
                </h3>
                <button
                  onClick={() =>
                    copyToClipboard(activeContent.hashtags.map(tag => `#${tag}`).join(' '), 'hashtags')
                  }
                  className="px-3 py-1.5 bg-frame-purple/20 hover:bg-frame-purple/30 text-frame-purple rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
                >
                  {copiedItem === 'hashtags' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeContent.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gray-800/50 text-frame-purple rounded-lg text-sm hover:bg-gray-700 transition-all"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultsDisplay;
