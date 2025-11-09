import { useState, useEffect } from 'react';
import { X, TrendingUp, Clock, Calendar, Zap, AlertCircle } from 'lucide-react';

function ApiUsageDashboard({ onClose, dailyUsed = 0 }) {
  const [currentUsed, setCurrentUsed] = useState(dailyUsed);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    setCurrentUsed(dailyUsed);
    setLastUpdate(new Date());
  }, [dailyUsed]);

  const dailyLimit = 1400;
  const percentage = Math.min(Math.round((currentUsed / dailyLimit) * 100), 100);
  const remaining = Math.max(dailyLimit - currentUsed, 0);
  const isWarning = percentage > 70;
  const isCritical = percentage > 90;

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
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
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
            
            {/* Status Banner */}
            {isCritical ? (
              <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-bold text-lg">⚠️ Critical Usage Level</p>
                  <p className="text-red-200 text-sm mt-1">
                    You've used {percentage}% ({currentUsed} of {dailyLimit}) of your daily quota!
                  </p>
                </div>
              </div>
            ) : isWarning ? (
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-bold text-lg">📊 High Usage</p>
                  <p className="text-yellow-200 text-sm mt-1">
                    You've used {percentage}% ({currentUsed} of {dailyLimit}) of your daily quota.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
                <Zap className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-400 font-bold text-lg">✅ Good Standing</p>
                  <p className="text-green-200 text-sm mt-1">
                    You're using {percentage}% ({currentUsed} of {dailyLimit}). You're all good!
                  </p>
                </div>
              </div>
            )}

            {/* Giant Counter */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Requests Used Today</p>
              <p className={`text-7xl font-bold mb-2 ${
                isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-orange-500'
              }`}>
                {currentUsed}
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
                      : 'bg-gradient-to-r from-orange-500 to-pink-500'
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
                <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{remaining}</p>
                <p className="text-sm text-gray-400 mt-1">Remaining Today</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">50/min</p>
                <p className="text-sm text-gray-400 mt-1">Rate Limit</p>
              </div>
            </div>

            {/* Last Update */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
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
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 rounded-lg text-white font-medium hover:scale-105 transition-transform text-sm"
              >
                Get Free API Key →
              </a>
            </div>

            {/* How it Works */}
            <div className="bg-gray-800/30 rounded-xl p-4">
              <p className="text-white font-medium text-sm mb-3">📊 How Tracking Works</p>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>✅ Every generation = 5 API requests (1 for image + 4 retries)</li>
                <li>✅ Counter updates with each generation</li>
                <li>✅ Resets daily at midnight PT</li>
                <li>✅ Real-time tracking from parent component</li>
                <li>✅ No external storage required</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApiUsageDashboard;