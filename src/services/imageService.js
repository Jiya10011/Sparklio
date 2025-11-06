/**
 * Enhanced Image Generation Service for Sparklio
 * Multiple providers with automatic fallback
 */

// Image providers (in priority order)
const IMAGE_PROVIDERS = [
  {
    name: 'Pollinations',
    generate: (prompt) => {
      const encoded = encodeURIComponent(prompt);
      return `https://image.pollinations.ai/prompt/${encoded}?width=1080&height=1080&nologo=true&enhance=true&model=turbo&seed=${Date.now()}`;
    }
  },
  {
    name: 'Picsum',
    generate: () => {
      return `https://picsum.photos/1080/1080?random=${Date.now()}`;
    }
  }
];

// Beautiful gradient placeholders
const GRADIENT_PLACEHOLDERS = [
  { bg: 'FF6B35', text: 'FFFFFF', name: 'Sparklio Orange' },
  { bg: 'FF006E', text: 'FFFFFF', name: 'Sparklio Pink' },
  { bg: '8338EC', text: 'FFFFFF', name: 'Sparklio Purple' },
  { bg: 'FFB6C1', text: '333333', name: 'Rose' },
  { bg: 'B19CD9', text: 'FFFFFF', name: 'Lavender' },
  { bg: '77DD77', text: '333333', name: 'Mint' },
  { bg: 'AEC6CF', text: '333333', name: 'Sky' },
  { bg: 'FFD700', text: '333333', name: 'Gold' },
];

/**
 * Main image generation function with multiple fallbacks
 */
export async function generateImage(stylePrompt, topic, retries = 2) {
  console.log(`🎨 Generating image for: "${topic}"`);
  
  // Try AI generation first
  for (let i = 0; i < IMAGE_PROVIDERS.length; i++) {
    const provider = IMAGE_PROVIDERS[i];
    
    try {
      console.log(`🔄 Trying ${provider.name}...`);
      
      const enhancedPrompt = createEnhancedPrompt(stylePrompt, topic);
      const imageUrl = provider.generate(enhancedPrompt);
      
      // Verify image loads
      const isValid = await verifyImageLoads(imageUrl, 8000);
      
      if (isValid) {
        console.log(`✅ ${provider.name} succeeded`);
        return imageUrl;
      }
      
    } catch (error) {
      console.warn(`⚠️ ${provider.name} failed:`, error.message);
      continue;
    }
  }
  
  // All providers failed - use beautiful placeholder
  console.log('📦 All providers failed, using placeholder');
  return generatePlaceholder(topic);
}

/**
 * Create enhanced prompt for better image quality
 */
function createEnhancedPrompt(stylePrompt, topic) {
  const qualityTerms = [
    'high quality',
    'professional',
    'detailed',
    'sharp focus',
    'vibrant colors'
  ];
  
  const socialTerms = [
    'social media optimized',
    'eye-catching',
    'modern aesthetic'
  ];
  
  // Combine and limit length
  const combined = [
    stylePrompt,
    topic,
    ...qualityTerms.slice(0, 2),
    ...socialTerms.slice(0, 1)
  ].join(', ');
  
  // Limit to 200 characters for better results
  return combined.slice(0, 200);
}

/**
 * Verify image URL loads properly
 */
async function verifyImageLoads(url, timeout = 8000) {
  return new Promise((resolve) => {
    const img = new Image();
    const timeoutId = setTimeout(() => {
      img.src = ''; // Stop loading
      resolve(false);
    }, timeout);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      resolve(false);
    };
    
    img.src = url;
  });
}

/**
 * Generate beautiful gradient placeholder
 */
function generatePlaceholder(topic) {
  // Random gradient
  const gradient = GRADIENT_PLACEHOLDERS[
    Math.floor(Math.random() * GRADIENT_PLACEHOLDERS.length)
  ];
  
  // Truncate topic for placeholder
  const displayTopic = topic.length > 30 
    ? topic.substring(0, 27) + '...' 
    : topic;
  
  // Create placeholder with topic
  const placeholderUrl = `https://placehold.co/1080x1080/${gradient.bg}/${gradient.text}?text=${encodeURIComponent(displayTopic)}&font=montserrat`;
  
  console.log(`📦 Generated ${gradient.name} placeholder`);
  return placeholderUrl;
}

/**
 * Preload image before displaying
 */
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      console.log('✅ Image preloaded successfully');
      resolve(url);
    };
    
    img.onerror = (error) => {
      console.error('❌ Image preload failed');
      reject(error);
    };
    
    // Set crossOrigin for external images
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

/**
 * Download image to device with multiple fallbacks
 */
export async function downloadImage(url, filename = 'sparklio-image.png') {
  try {
    console.log('💾 Attempting download...');
    
    // Method 1: Try fetch + blob
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
      
      console.log('✅ Download successful (method 1)');
      return true;
      
    } catch (fetchError) {
      console.warn('⚠️ Fetch download failed, trying alternative...');
      
      // Method 2: Direct link download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Download initiated (method 2)');
      return true;
    }
    
  } catch (error) {
    console.error('❌ All download methods failed:', error);
    
    // Method 3: Open in new tab as last resort
    window.open(url, '_blank');
    console.log('ℹ️ Opened in new tab - user can right-click save');
    
    return false;
  }
}

/**
 * Platform-specific image optimization
 */
export function optimizeImageForPlatform(imageUrl, platform) {
  const dimensions = {
    instagram: { width: 1080, height: 1080 },  // Square
    linkedin: { width: 1200, height: 627 },    // Landscape
    twitter: { width: 1200, height: 675 },     // Landscape
    youtube: { width: 1280, height: 720 }      // 16:9
  };
  
  const size = dimensions[platform] || dimensions.instagram;
  
  // If URL is from Pollinations, update dimensions
  if (imageUrl.includes('pollinations.ai')) {
    const optimizedUrl = imageUrl.replace(
      /width=\d+&height=\d+/,
      `width=${size.width}&height=${size.height}`
    );
    
    console.log(`📐 Optimized for ${platform}: ${size.width}x${size.height}`);
    return optimizedUrl;
  }
  
  // Return original if can't optimize
  return imageUrl;
}

/**
 * Validate image URL format
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Get image dimensions
 */
export function getImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = reject;
    img.src = url;
  });
}

export default {
  generateImage,
  preloadImage,
  downloadImage,
  optimizeImageForPlatform,
  isValidImageUrl,
  getImageDimensions
};