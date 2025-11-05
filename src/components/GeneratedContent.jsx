import { Copy, Download, Sparkles, ImageDown, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { generateImage, preloadImage, downloadImage, optimizeImageForPlatform } from '../services/imageService';

export default function GeneratedContent({ content }) {
  const [copied, setCopied] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const copyAll = () => {
    const allText = content.youtubeType
      ? content.content
      : `${content.hook}\n\n${content.caption}\n\n${content.hashtags}`;
    copyToClipboard(allText, 'all');
  };

  // 🖼️ Auto-generate image when content loads
  useEffect(() => {
    const fetchImage = async () => {
      if (!content || !content.imagePrompt || !content.topic) return;
      setLoadingImage(true);

      try {
        const rawUrl = await generateImage(content.imagePrompt, content.topic);
        const optimizedUrl = optimizeImageForPlatform(rawUrl, content.platform);
        await preloadImage(optimizedUrl);
        setImageUrl(optimizedUrl);
      } catch (err) {
        console.error('Image generation failed:', err);
        setImageUrl('');
      } finally {
        setLoadingImage(false);
      }
    };

    fetchImage();
  }, [content]);

  // 🎥 YouTube Content
  if (content.platform === 'youtube') {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
        <div className="bg-slate-800/50 backdrop-blur border border-red-500/20 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-red-400" />
              Your YouTube {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
            </h3>
            <button
              onClick={copyAll}
              aria-label="Copy all YouTube content"
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-400 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              {copied === 'all' ? '✓ Copied!' : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-6 border border-red-500/20">
            <pre className="text-white whitespace-pre-wrap font-sans leading-relaxed">
              {content.content}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // 📱 Regular Platform Content
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      {/* Hook Section */}
      <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/20 rounded-2xl p-8 transition hover:border-cyan-400/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-cyan-400">🎯 Viral Hook</h3>
          <button
            onClick={() => copyToClipboard(content.hook, 'hook')}
            aria-label="Copy hook"
            className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all text-sm flex items-center gap-2"
          >
            {copied === 'hook' ? '✓ Copied' : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
        <p className="text-white text-lg font-medium leading-relaxed">{content.hook}</p>
      </div>

      {/* Caption Section */}
      <div className="bg-slate-800/50 backdrop-blur border border-blue-500/20 rounded-2xl p-8 transition hover:border-blue-400/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-blue-400">💬 Caption</h3>
          <button
            onClick={() => copyToClipboard(content.caption, 'caption')}
            aria-label="Copy caption"
            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm flex items-center gap-2"
          >
            {copied === 'caption' ? '✓ Copied' : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
        <p className="text-white leading-relaxed whitespace-pre-wrap">{content.caption}</p>
      </div>

      {/* Hashtags Section */}
      <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 transition hover:border-purple-400/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-purple-400">🔥 Hashtags</h3>
          <button
            onClick={() => copyToClipboard(content.hashtags, 'hashtags')}
            aria-label="Copy hashtags"
            className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all text-sm flex items-center gap-2"
          >
            {copied === 'hashtags' ? '✓ Copied' : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
        <p className="text-white leading-relaxed">{content.hashtags}</p>
      </div>

      {/* 🎨 Image Section */}
      <div className="bg-slate-800/50 backdrop-blur border border-orange-500/20 rounded-2xl p-8 transition hover:border-orange-400/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-orange-400">🎨 Generated Image</h3>
          {imageUrl && (
            <button
              onClick={() => downloadImage(imageUrl, 'sparklio-post.png')}
              aria-label="Download image"
              className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all text-sm flex items-center gap-2"
            >
              <ImageDown className="w-4 h-4" /> Download
            </button>
          )}
        </div>

        {loadingImage ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            Generating your image...
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Generated visual"
            className="w-full rounded-xl shadow-lg border border-orange-500/30"
          />
        ) : (
          <p className="text-gray-500 italic">No image available for this post.</p>
        )}
      </div>

      {/* Image Prompt Info */}
      <div className="bg-slate-800/50 backdrop-blur border border-orange-500/20 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-orange-400 mb-2">🪄 Image Prompt</h4>
        <p className="text-gray-300 italic">{content.imagePrompt}</p>
        <p className="text-gray-500 text-sm mt-2">
          💡 Use this prompt in tools like Midjourney, DALL·E, or Stable Diffusion.
        </p>
      </div>

      {/* Copy All Button */}
      <button
        onClick={copyAll}
        aria-label="Copy all content"
        className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white text-lg font-bold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-3"
      >
        {copied === 'all' ? '✓ All Content Copied!' : <>
          <Download className="w-5 h-5" />
          Copy All Content
        </>}
      </button>

      {/* Generate Another Post Button */}
      <button
        onClick={() => window.location.reload()}
        aria-label="Generate another post"
        className="w-full py-4 bg-slate-800/50 border-2 border-cyan-500/30 text-cyan-400 text-lg font-bold rounded-2xl hover:bg-slate-700/50 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-3"
      >
        <Sparkles className="w-5 h-5" />
        Generate Another Post
      </button>
    </div>
  );
}
