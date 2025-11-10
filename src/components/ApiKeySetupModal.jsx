import { useState } from 'react';
import { X, Key, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { saveUserApiKey } from '../services/userApiKeyService';

function ApiKeySetupModal({ isOpen, onClose, userId, onSuccess }) {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError(null);

    // Validate API key format
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    if (apiKey.trim().length < 30) {
      setError('API key seems too short. Please check and try again.');
      return;
    }

    if (!apiKey.startsWith('AIza')) {
      setError('Invalid API key format. Gemini API keys start with "AIza"');
      return;
    }

    setSaving(true);
    console.log('💾 Saving API key for user:', userId);

    try {
      // Save to Firebase
      const result = await saveUserApiKey(userId, apiKey.trim());

      if (!result.success) {
        throw new Error(result.error || 'Failed to save API key');
      }

      console.log('✅ API key saved successfully');
      
      // Show success state
      setShowSuccess(true);

      // Wait 1.5 seconds to show success message
      setTimeout(() => {
        setShowSuccess(false);
        setSaving(false);
        setApiKey('');
        
        // Call onSuccess callback BEFORE closing
        if (onSuccess) {
          onSuccess();
        }
        
        // Close modal after callback
        setTimeout(() => {
          onClose();
        }, 100);
        
      }, 1500);

    } catch (err) {
      console.error('❌ Save error:', err);
      setError(err.message || 'Failed to save API key. Please try again.');
      setSaving(false);
      setShowSuccess(false);
    }
  };

  const handleClose = () => {
    if (!saving && !showSuccess) {
      setApiKey('');
      setError(null);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="bg-gray-900 border-2 border-gray-700 rounded-2xl max-w-lg w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          
          {showSuccess ? (
            // Success State
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">All Set! 🎉</h3>
              <p className="text-gray-300 mb-1">Your API key is saved securely.</p>
              <p className="text-gray-400 text-sm">You're ready to generate!</p>
              <div className="mt-4">
                <div className="w-12 h-12 border-4 border-spark-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-spark-orange to-spark-pink rounded-xl flex items-center justify-center">
                      <Key className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Add API Key</h3>
                      <p className="text-sm text-gray-400">Get unlimited generations</p>
                    </div>
                  </div>
                  {!saving && (
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                
                {/* Info Card */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <span className="text-xl">🔑</span>
                    Why do I need this?
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-200">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span><strong>1,500+ free generations</strong> per day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span><strong>100% free</strong> from Google</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span><strong>No credit card</strong> required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>Takes <strong>less than 2 minutes</strong></span>
                    </li>
                  </ul>
                </div>

                {/* Step 1: Get API Key */}
                <div className="space-y-3">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <span className="w-6 h-6 bg-spark-orange rounded-full flex items-center justify-center text-sm">1</span>
                    Get Your Free API Key
                  </h4>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-gradient-to-r from-spark-orange to-spark-pink p-4 rounded-xl text-white font-medium hover:scale-[1.02] transition-all group"
                  >
                    <span>Open Google AI Studio</span>
                    <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  <p className="text-xs text-gray-400 bg-gray-800/50 p-3 rounded-lg">
                    💡 <strong>Quick Guide:</strong> Click "Create API Key" → Select a project (or create new) → Copy the key
                  </p>
                </div>

                {/* Step 2: Paste API Key */}
                <div className="space-y-3">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <span className="w-6 h-6 bg-spark-orange rounded-full flex items-center justify-center text-sm">2</span>
                    Paste Your API Key
                  </h4>
                  
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      disabled={saving}
                      className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-spark-orange focus:border-transparent transition-all disabled:opacity-50"
                    />
                    {apiKey && apiKey.startsWith('AIza') && (
                      <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={!apiKey.trim() || saving}
                  className="w-full bg-gradient-to-r from-spark-orange to-spark-pink text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-5 h-5" />
                      <span>Save & Continue</span>
                    </>
                  )}
                </button>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700 bg-gray-800/30">
                <p className="text-xs text-gray-400 text-center">
                  🔒 Your API key is encrypted and stored securely in Firebase. We never see or access your key.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default ApiKeySetupModal;