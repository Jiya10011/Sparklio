import { useState } from "react";
import { X, Key, Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { saveUserApiKey } from "../services/userApiKeyService";

export default function ApiKeySetupModal({ isOpen, onClose, userId, onSuccess }) {
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: instructions, 2: input, 3: success

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🟢 Save API Key button clicked!");
      console.log("User ID:", userId);
      console.log("API Key entered:", apiKey);

      if (!userId) {
        setError("User ID is missing. Please log in again.");
        setLoading(false);
        return;
      }

      const result = await saveUserApiKey(userId, apiKey.trim());
      console.log("Save API Key result:", result);

      if (result === true || result?.success === true) {
        console.log("✅ API key successfully saved to Firestore!");
        setStep(3);
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 2000);
      } else {
        console.warn("⚠️ Save API key returned error:", result);
        setError(result?.error || "Failed to save API key.");
      }
    } catch (err) {
      console.error("❌ Error saving API key:", err);
      setError("Failed to save API key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-surface border border-gray-700 rounded-2xl max-w-2xl w-full p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">

        {/* Close Button */}
        {step !== 3 && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Step 1: Instructions */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-spark-orange to-spark-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Get Your Free API Key</h2>
              <p className="text-gray-400">
                Sparklio uses your personal Gemini API key. Takes 1 minute!
              </p>
            </div>

            <div className="space-y-6">
              {/* Benefits */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Why Your Own Key?
                </h3>
                <ul className="text-green-200 text-sm space-y-1">
                  <li>✅ 100% FREE (Google gives 1,500 requests/day)</li>
                  <li>✅ Your own quota (no sharing)</li>
                  <li>✅ Encrypted & secure</li>
                  <li>✅ Unlimited generations</li>
                </ul>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">How to Get Your Key:</h3>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-spark-orange rounded-full flex items-center justify-center font-bold text-white">
                    1
                  </div>
                  <div>
                    <p className="text-white font-medium">Go to Google AI Studio</p>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-spark-orange hover:text-spark-pink transition-colors flex items-center gap-1 text-sm mt-1"
                    >
                      Open AI Studio <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-spark-orange rounded-full flex items-center justify-center font-bold text-white">
                    2
                  </div>
                  <div>
                    <p className="text-white font-medium">Click "Get API Key"</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Then "Create API key in new project"
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-spark-orange rounded-full flex items-center justify-center font-bold text-white">
                    3
                  </div>
                  <div>
                    <p className="text-white font-medium">Copy the key</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Starts with "AIza..." (39 characters)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-spark-orange rounded-full flex items-center justify-center font-bold text-white">
                    4
                  </div>
                  <div>
                    <p className="text-white font-medium">Paste it here</p>
                    <p className="text-gray-400 text-sm mt-1">
                      We'll encrypt and store it securely
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-gradient-to-r from-spark-orange via-spark-pink to-frame-purple text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                I Have My API Key →
              </button>

              <p className="text-center text-gray-500 text-xs">
                Takes only 1 minute • Completely free
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Input Key */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-spark-orange to-spark-pink rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Enter Your API Key</h2>
              <p className="text-gray-400">Paste the key from Google AI Studio</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Error</p>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Gemini API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-spark-orange focus:ring-2 focus:ring-spark-orange/20 transition-all font-mono text-sm"
                  disabled={loading}
                  required
                />
                <p className="text-gray-500 text-xs mt-2">
                  Should start with "AIza" and be 39 characters
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-200 text-sm flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Privacy:</strong> Your API key is encrypted before storage. We never see or use your key. It stays private.
                  </span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-800 text-gray-300 font-medium rounded-xl hover:bg-gray-700 transition-all"
                  disabled={loading}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !apiKey.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-spark-orange via-spark-pink to-frame-purple text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Save API Key"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">All Set! 🎉</h2>
            <p className="text-gray-400 mb-6">
              Your API key is saved securely. You're ready to generate!
            </p>
            <div className="inline-block">
              <Loader2 className="w-8 h-8 text-spark-orange animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
