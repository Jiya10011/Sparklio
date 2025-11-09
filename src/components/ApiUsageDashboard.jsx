import { useState, useEffect } from 'react';
import { X, TrendingUp, Clock, Calendar, Zap, AlertCircle } from 'lucide-react';

function ApiUsageDashboard({ onClose }) {
  const [dailyUsed, setDailyUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Load usage data
  const loadUsage = () => {
    try {
      console.log('🔍 Loading API usage...');
      
      const today = new Date().toDateString();
      const stored = localStorage.getItem('api-daily-count');
      
      console.log('📦 Raw localStorage data:', stored);
      
      if (!stored) {
        console.log('⚠️ No data found, setting to 0');
        setDailyUsed(0);
        setIsLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        console.log('📊 Parsed data:', parsed);
        
        if (parsed.date === today) {
          const count = parseInt(parsed.count) || 0;
          console.log('✅ Today\'s count:', count);
          setDailyUsed(count);
        } else {
          console.log('📅 Data is from different day, resetting to 0');
          setDailyUsed(0);
          // Clear old data
          localStorage.removeItem('api-daily-count');
        }
      } catch (parseError) {
        console.error('❌ Parse error:', parseError);
        setDailyUsed(0);
      }
      
      setIsLoading(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Load error:', error);
      setDailyUsed(0);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load immediately
    loadUsage();
    
    // Reload every 3 seconds
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing...');
      loadUsage();
    }, 3000);

    // Listen for storage changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'api-daily-count') {
        console.log('💾 Storage changed externally, reloading...');
        loadUsage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom event from same tab
    const handleCustomUpdate = () => {
      console.log('🔔 Custom update event received');
      loadUsage();
    };
    
    window.addEventListener('api-usage-updated', handleCustomUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('api-usage-updated', handleCustomUpdate);
    };
  }, []);

  const dailyLimit = 1400;
  const percentage = Math.min(Math.round((dailyUsed / dailyLimit) * 100), 100);
  const remaining = Math.max(dailyLimit - dailyUsed, 0);
  const isWarning = percentage > 70;
  const isCritical = percentage > 90;

  // Manual refresh button
  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    loadUsage();
  };

  // Reset function
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the counter? This cannot be undone.')) {
      localStorage.removeItem('api-daily-count');
      setDailyUsed(0);
      console.log('🔄 Counter reset');
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]" onClick={onClose} />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
            <div className="w-12 h-12 border-4 border-spark-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-white text-center mt-4">Loading usage data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Dashboard Panel */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-spark-orange to-spark-pink rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">API Usage Dashboard</h2>
                <p className="text-sm text-gray-400">Real-time usage tracking</p>
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
            
            {/* Debug Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-400 font-medium text-sm mb-2 flex items-center gap-2">
                🔍 Debug Info
                <button
                  onClick={handleManualRefresh}
                  className="ml-auto text-xs px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded transition-all"
                >
                  🔄 Refresh
                </button>
              </p>
              <div className="space-y-1 text-xs text-blue-200">
                <p>Current Count: <strong>{dailyUsed}</strong></p>
                <p>Percentage: <strong>{percentage}%</strong></p>
                <p>Remaining: <strong>{remaining}</strong></p>
                <p>Last Updated: <strong>{lastUpdated.toLocaleTimeString()}</strong></p>
                <p>localStorage Key: <code className="bg-blue-500/20 px-1 rounded">api-daily-count</code></p>
              </div>
            </div>

            {/* Status Banner */}
            {isCritical ? (
              <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-bold text-lg">⚠️ Critical Usage Level</p>
                  <p className="text-red-200 text-sm mt-1">
                    You've used {percentage}% ({dailyUsed} of {dailyLimit}) of your daily quota!
                  </p>
                </div>
              </div>
            ) : isWarning ? (
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-bold text-lg">📊 High Usage</p>
                  <p className="text-yellow-200 text-sm mt-1">
                    You've used {percentage}% ({dailyUsed} of {dailyLimit}) of your daily quota.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
                <Zap className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-bold text-lg">✅ Good Standing</p>
                  <p className="text-green-200 text-sm mt-1">
                    You're using {percentage}% ({dailyUsed} of {dailyLimit}). You're all good!
                  </p>
                </div>
              </div>
            )}

            {/* Giant Counter */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Requests Used Today</p>
              <p className={`text-7xl font-bold mb-2 ${
                isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-spark-orange'
              }`}>
                {dailyUsed}
              </p>
              <p className="text-gray-400 text-lg">out of {dailyLimit}</p>
              
              {/* Progress Bar */}
              <div className="mt-6 w-full bg-gray-700 rounded-full h-6 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 flex items-center justify-center ${
                    isCritical 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : isWarning 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                      : 'bg-gradient-to-r from-spark-orange to-spark-pink'
                  }`}
                  style={{ width: `${percentage}%` }}
                >
                  <span className="text-white text-xs font-bold">{percentage}%</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                <Calendar className="w-8 h-8 text-spark-orange mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{remaining}</p>
                <p className="text-sm text-gray-400 mt-1">Remaining Today</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">50/min</p>
                <p className="text-sm text-gray-400 mt-1">Rate Limit</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleManualRefresh}
                className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl transition-all font-medium flex items-center justify-center gap-2"
              >
                🔄 Refresh Now
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl transition-all font-medium flex items-center justify-center gap-2"
              >
                🗑️ Reset Counter
              </button>
            </div>

            {/* Get API Key CTA */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-5">
              <p className="text-white font-medium mb-2">💡 Get Unlimited Access</p>
              <p className="text-sm text-gray-300 mb-4">
                Add your own Gemini API key to remove all limits. It's free!
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

            {/* How it Works */}
            <div className="bg-gray-800/30 rounded-xl p-4">
              <p className="text-white font-medium text-sm mb-3">📊 How Tracking Works</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>✅ Each variation = 5 API requests (content generation)</li>
                <li>✅ Data stored in browser localStorage</li>
                <li>✅ Resets daily at midnight (local time)</li>
                <li>✅ Updates automatically every 3 seconds</li>
                <li>✅ No server required - all client-side</li>
              </ul>
            </div>

            {/* Troubleshooting */}
            <details className="bg-gray-800/30 rounded-xl">
              <summary className="p-4 cursor-pointer text-white font-medium text-sm hover:bg-gray-800/50 transition-all rounded-xl">
                🔧 Troubleshooting
              </summary>
              <div className="p-4 pt-0 space-y-2 text-xs text-gray-400">
                <p><strong className="text-white">Dashboard not updating?</strong></p>
                <p>• Click "Refresh Now" button above</p>
                <p>• Check if localStorage is enabled in your browser</p>
                <p>• Try clearing browser cache and reload page</p>
                <p className="mt-3"><strong className="text-white">Counter seems wrong?</strong></p>
                <p>• Use "Reset Counter" to start fresh</p>
                <p>• Make sure you're in the same browser/device</p>
                <p>• Counter resets automatically at midnight</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApiUsageDashboard;