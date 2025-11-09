// src/components/ApiUsageDashboard.jsx
import { useState, useEffect } from 'react';
import { X, TrendingUp, Clock, Calendar, Zap, AlertCircle } from 'lucide-react';

function ApiUsageDashboard({ onClose }) {
  const [stats, setStats] = useState({
    perMinute: { used: 0, limit: 50, remaining: 50 },
    daily: { used: 0, limit: 1400, remaining: 1400, percentage: 0 }
  });

  useEffect(() => {
    const updateStats = () => {
      try {
        // Get today's date
        const today = new Date().toDateString();
        
        // Get stored count from localStorage
        const storedData = localStorage.getItem('api-daily-count');
        
        let dailyUsed = 0;
        
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            // Check if it's today's data
            if (parsed.date === today) {
              dailyUsed = parseInt(parsed.count) || 0;
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }

        const dailyLimit = 1400;
        const percentage = Math.round((dailyUsed / dailyLimit) * 100);

        const newStats = {
          perMinute: {
            used: 0,
            limit: 50,
            remaining: 50
          },
          daily: {
            used: dailyUsed,
            limit: dailyLimit,
            remaining: dailyLimit - dailyUsed,
            percentage: percentage
          }
        };

        console.log('📊 Dashboard stats:', newStats);
        setStats(newStats);

      } catch (error) {
        console.error('❌ Stats update error:', error);
      }
    };

    // Update immediately
    updateStats();
    
    // Update every 3 seconds
    const interval = setInterval(updateStats, 3000);

    return () => clearInterval(interval);
  }, []);

  const dailyPercentage = stats.daily.percentage;
  const isWarning = dailyPercentage > 70;
  const isCritical = dailyPercentage > 90;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Dashboard Panel */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-spark-orange to-spark-pink rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">API Usage Dashboard</h2>
                <p className="text-sm text-gray-400">Monitor your daily limits</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Status Banner */}
            {isCritical ? (
              <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-bold text-lg">⚠️ Critical Usage Level</p>
                  <p className="text-red-200 text-sm mt-1">
                    You've used {dailyPercentage}% of your daily quota. Add your own API key for unlimited access!
                  </p>
                </div>
              </div>
            ) : isWarning ? (
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-bold text-lg">📊 High Usage</p>
                  <p className="text-yellow-200 text-sm mt-1">
                    You've used {dailyPercentage}% of your daily quota. Consider adding your own API key.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
                <Zap className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-bold text-lg">✅ Good Standing</p>
                  <p className="text-green-200 text-sm mt-1">
                    You're using {dailyPercentage}% of your daily quota. You're all good!
                  </p>
                </div>
              </div>
            )}

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Daily Usage Card */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-spark-orange/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-spark-orange" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Daily Quota</p>
                    <p className="text-2xl font-bold text-white">{stats.daily.used}</p>
                  </div>
                </div>
                
                {/* Progress Circle */}
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-700"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - dailyPercentage / 100)}`}
                        className={`transition-all duration-1000 ${
                          isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-spark-orange'
                        }`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${
                        isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-spark-orange'
                      }`}>
                        {dailyPercentage}%
                      </span>
                      <span className="text-xs text-gray-400">Used</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Limit:</span>
                    <span className="text-white font-medium">{stats.daily.limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Remaining:</span>
                    <span className="text-white font-medium">{stats.daily.remaining}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Used Today:</span>
                    <span className="text-white font-medium">{stats.daily.used}</span>
                  </div>
                </div>
              </div>

              {/* Per-Minute Card */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Rate Limit</p>
                    <p className="text-2xl font-bold text-white">{stats.perMinute.limit}/min</p>
                  </div>
                </div>

                <div className="mb-4 text-center py-8">
                  <p className="text-gray-400 text-sm mb-2">Requests are rate-limited to</p>
                  <p className="text-white text-3xl font-bold">{stats.perMinute.limit}</p>
                  <p className="text-gray-400 text-sm mt-2">per minute</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rate Limit:</span>
                    <span className="text-white font-medium">{stats.perMinute.limit}/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Per Request:</span>
                    <span className="text-white font-medium">~1-2 sec</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Queue System:</span>
                    <span className="text-green-400 font-medium">Active ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">Overall Progress</p>
                <p className="text-sm text-white font-medium">
                  {stats.daily.used} / {stats.daily.limit} requests
                </p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    isCritical 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : isWarning 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                      : 'bg-gradient-to-r from-spark-orange to-spark-pink'
                  }`}
                  style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0</span>
                <span>{stats.daily.limit}</span>
              </div>
            </div>

            {/* Debug Info (only show if used > 0) */}
            {stats.daily.used > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-400 font-medium text-sm mb-2">✅ Tracking Active</p>
                <p className="text-blue-200 text-xs">
                  Your usage is being tracked. Data refreshes every 3 seconds.
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-5">
              <p className="text-white font-medium mb-2">💡 Get Unlimited Access</p>
              <p className="text-sm text-gray-300 mb-4">
                Add your own Gemini API key to remove all limits. It's free and takes just 2 minutes!
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-spark-orange to-spark-pink px-4 py-2 rounded-lg text-white font-medium hover:scale-105 transition-transform text-sm"
              >
                Get Free API Key →
              </a>
            </div>

            {/* Manual Test Button (for debugging) */}
            <div className="text-center">
              <button
                onClick={() => {
                  const testData = {
                    date: new Date().toDateString(),
                    count: stats.daily.used + 5
                  };
                  localStorage.setItem('api-daily-count', JSON.stringify(testData));
                  // Trigger immediate update
                  window.dispatchEvent(new Event('storage'));
                  console.log('🧪 Test: Added 5 to count');
                }}
                className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
              >
                🧪 Test: Add 5 Requests (Debug Only)
              </button>
              <p className="text-xs text-gray-600 mt-2">
                Daily quota resets at midnight PT
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApiUsageDashboard;