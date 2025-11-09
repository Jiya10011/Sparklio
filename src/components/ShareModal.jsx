import { useState } from 'react';
import { X, Copy, CheckCircle2, Share2 } from 'lucide-react';

function ShareModal({ content, onClose }) {
  const [copied, setCopied] = useState(false);

  // Clean and format content
  const cleanHashtags = content.hashtags
    .map(tag => tag.replace(/^#+/, ''))
    .map(tag => `#${tag}`)
    .join(' ');
  
  const fullText = `${content.hook}\n\n${content.caption}\n\n${cleanHashtags}`;
  const shortText = `${content.hook}\n\n${content.caption.slice(0, 200)}...`;

  // Share to WhatsApp
  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
    window.open(url, '_blank', 'width=600,height=700');
  };

  // Share to Twitter
  const shareToTwitter = () => {
    const tweetText = shortText.length > 280 ? shortText.slice(0, 277) + '...' : shortText;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank', 'width=600,height=700');
  };

  // Share to LinkedIn
  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=700');
  };

  // Instagram - Copy with instructions
  const shareToInstagram = () => {
    copyToClipboard();
    alert('Content copied! Open Instagram app and paste it into your post caption.');
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(fullText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const textarea = document.createElement('textarea');
    textarea.value = fullText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[10000]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full shadow-2xl animate-scale-in">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-spark-orange to-spark-pink rounded-lg flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Share Content</h3>
                  <p className="text-sm text-gray-400">Choose your platform</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div className="p-6 space-y-3">
            
            {/* Instagram */}
            <button
              onClick={shareToInstagram}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📸</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">Instagram</p>
                <p className="text-xs text-gray-400">Copy & paste in Instagram app</p>
              </div>
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={shareToWhatsApp}
              className="w-full flex items-center gap-4 p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💬</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">WhatsApp</p>
                <p className="text-xs text-gray-400">Share via WhatsApp</p>
              </div>
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>

            {/* Twitter */}
            <button
              onClick={shareToTwitter}
              className="w-full flex items-center gap-4 p-4 bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/30 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🐦</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">Twitter / X</p>
                <p className="text-xs text-gray-400">Post on Twitter</p>
              </div>
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={shareToLinkedIn}
              className="w-full flex items-center gap-4 p-4 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/30 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💼</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">LinkedIn</p>
                <p className="text-xs text-gray-400">Share professionally</p>
              </div>
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>

            {/* Copy to Clipboard */}
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                {copied ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : (
                  <Copy className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </p>
                <p className="text-xs text-gray-400">
                  {copied ? 'Paste anywhere' : 'Copy text content'}
                </p>
              </div>
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 bg-gray-800/30">
            <p className="text-xs text-gray-500 text-center">
              💡 Tip: Instagram requires the app - copy and paste there
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

export default ShareModal;