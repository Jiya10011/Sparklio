import { AlertCircle, X } from 'lucide-react';

export default function ErrorToast({ message, onClose }) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="bg-red-500/90 backdrop-blur border border-red-400 rounded-xl p-4 shadow-2xl max-w-md flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-white flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-white font-bold mb-1">Generation Failed</h4>
          <p className="text-red-100 text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-red-600 rounded-lg p-1 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}