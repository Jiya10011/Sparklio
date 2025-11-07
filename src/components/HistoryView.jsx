import { useState, useEffect } from 'react';
import { Sparkles, Trash2, Eye, Search, Calendar, Tag } from 'lucide-react';

function HistoryView({ onBack, onLoadResult, onGenerateNew }) {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem('sparklio-history') || '[]');
      setHistory(savedHistory);
    } catch (err) {
      console.error('Failed to load history:', err);
      setHistory([]);
    }
  };

  const deleteHistoryItem = (id) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('sparklio-history', JSON.stringify(updatedHistory));
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('sparklio-history');
    }
  };

  // Filter history
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  const platforms = ['all', 'instagram', 'linkedin', 'twitter', 'youtube'];
  const platformEmojis = {
    all: '📱',
    instagram: '📸',
    linkedin: '💼',
    twitter: '🐦',
    youtube: '▶️'
  };

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-spark-orange/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-frame-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
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
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-spark-orange" />
            Your History
          </h2>
          <p className="text-gray-400">View and reload your past generations</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 bg-gradient-to-br from-dark-surface/90 to-dark-surface/50 backdrop-blur-xl rounded-2xl p-6 border border-spark-orange/20 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic..."
                className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-spark-orange focus:border-transparent transition-all"
              />
            </div>

            {/* Platform Filter */}
            <div className="flex gap-2 flex-wrap">
              {platforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setFilterPlatform(platform)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all capitalize flex items-center gap-2 ${
                    filterPlatform === platform
                      ? 'bg-gradient-to-r from-spark-orange to-spark-pink text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                  }`}
                >
                  <span>{platformEmojis[platform]}</span>
                  <span>{platform}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clear All */}
          {history.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearAllHistory}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear All History
              </button>
            </div>
          )}
        </div>

        {/* History Grid */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchQuery || filterPlatform !== 'all' ? 'No results found' : 'No history yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || filterPlatform !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Generate your first content to see it here!'}
            </p>
            <button
              onClick={onGenerateNew}
              className="bg-gradient-to-r from-spark-orange to-spark-pink px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Create Your First Content
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-dark-surface/90 to-dark-surface/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-spark-orange/50 transition-all shadow-xl group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-spark-orange to-spark-pink rounded-xl flex items-center justify-center text-2xl">
                      {platformEmojis[item.platform]}
                    </div>
                    <div>
                      <p className="text-sm text-spark-orange font-semibold uppercase">
                        {item.platform}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Topic */}
                <div className="mb-4">
                  <p className="text-white font-medium line-clamp-2 mb-2">{item.topic}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-gray-800/50 text-gray-400 rounded text-xs flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {item.style}
                    </span>
                    {item.variations && (
                      <span className="px-2 py-1 bg-spark-orange/20 text-spark-orange rounded text-xs font-medium">
                        {item.variations.length} variations
                      </span>
                    )}
                  </div>
                </div>

                {/* Preview Image */}
                {item.imageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}

                {/* Preview Text */}
                <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {item.variations?.[0]?.hook || item.variations?.[0]?.caption || 'No content preview'}
                  </p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => onLoadResult(item)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-spark-orange to-spark-pink text-white py-3 rounded-xl font-medium hover:scale-105 transition-all"
                >
                  <Eye className="w-5 h-5" />
                  View Full Content
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {history.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Showing {filteredHistory.length} of {history.length} generations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryView;