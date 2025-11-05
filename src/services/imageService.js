/**
 * Image Generation Service for Sparklio
 * Handles AI image generation with retry logic and fallbacks
 */

// Main image generation function
export async function generateImage(stylePrompt, topic, retries = 2) {
  try {
    console.log(`🎨 Generating image for: "${topic}"`);
    
    // Create enhanced prompt
    const enhancedPrompt = createEnhancedPrompt(stylePrompt, topic);
    
    // URL encode the prompt
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    
    // Generate image URL using Pollinations.ai (Free, no API key)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1080&nologo=true&enhance=true&model=turbo`;
    
    // Verify image loads (with timeout)
    await verifyImageLoads(imageUrl, 10000);
    
    console.log('✅ Image generated successfully');
    return imageUrl;
    
  } catch (error) {
    console.error('❌ Image generation error:', error);
    
    // Retry with simpler prompt
    if (retries > 0) {
      console.log(`🔄 Retrying with simpler prompt (${retries} attempts left)...`);
      const simplePrompt = `${topic}, modern, aesthetic, professional, social media post`;
      return generateImage(simplePrompt, topic, retries - 1);
    }
    
    // All retries failed - return beautiful placeholder
    console.log('📦 Using fallback placeholder');
    return generateFallbackImage(topic);
  }
}

// Create enhanced prompt for better quality
function createEnhancedPrompt(stylePrompt, topic) {
  const qualityTerms = [
    'high quality',
    'professional photography',
    '4k resolution',
    'detailed',
    'sharp focus',
    'well-lit'
  ];
  
  const socialMediaTerms = [
    'social media optimized',
    'trending aesthetic',
    'Instagram worthy',
    'eye-catching composition'
  ];
  
  // Combine with limits to avoid too-long prompts
  const fullPrompt = [
    stylePrompt,
    topic,
    ...qualityTerms.slice(0, 3),
    ...socialMediaTerms.slice(0, 2)
  ].join(', ');
  
  return fullPrompt;
}

// Verify image URL loads properly
async function verifyImageLoads(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Image loading timeout'));
    }, timeout);
    
    fetch(url, { method: 'HEAD' })
      .then(response => {
        clearTimeout(timeoutId);
        if (response.ok) {
          resolve(true);
        } else {
          reject(new Error(`Image fetch failed: ${response.status}`));
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

// Generate beautiful fallback placeholder
function generateFallbackImage(topic) {
  // Beautiful gradient colors
  const gradients = [
    { bg: 'FFB6C1', text: '333333', name: 'Rose' },      // Light Pink
    { bg: 'B19CD9', text: 'FFFFFF', name: 'Lavender' },  // Light Purple
    { bg: '77DD77', text: '333333', name: 'Mint' },      // Pastel Green
    { bg: 'AEC6CF', text: '333333', name: 'Sky' },       // Pastel Blue
    { bg: 'FFD700', text: '333333', name: 'Gold' },      // Gold
    { bg: 'FF6B9D', text: 'FFFFFF', name: 'Fuchsia' },   // Hot Pink
    { bg: '98D8C8', text: '333333', name: 'Seafoam' },   // Mint Green
    { bg: 'F7CAC9', text: '333333', name: 'Blush' }      // Rose Quartz
  ];
  
  // Random gradient
  const gradient = gradients[Math.floor(Math.random() * gradients.length)];
  
  // Truncate topic (max 30 chars for placeholder)
  const displayTopic = topic.length > 30 
    ? topic.substring(0, 27) + '...' 
    : topic;
  
  // Create placeholder URL
  const placeholderUrl = `https://placehold.co/1080x1080/${gradient.bg}/${gradient.text}?text=${encodeURIComponent(displayTopic)}&font=roboto`;
  
  console.log(`📦 Generated ${gradient.name} placeholder`);
  return placeholderUrl;
}

// Preload image to avoid flashing
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      console.log('✅ Image preloaded');
      resolve(url);
    };
    
    img.onerror = (error) => {
      console.error('❌ Image preload failed');
      reject(error);
    };
    
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

// Download image to device
export async function downloadImage(url, filename = 'sparklio-image.png') {
  try {
    console.log('💾 Downloading image...');
    
    const response = await fetch(url);
    const blob = await response.blob();
    
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(blobUrl);
    
    console.log('✅ Image downloaded');
    return true;
    
  } catch (error) {
    console.error('❌ Download failed:', error);
    throw new Error('Failed to download image');
  }
}

// Platform-specific image optimization
export function optimizeImageForPlatform(imageUrl, platform) {
  const dimensions = {
    instagram: { width: 1080, height: 1080 },  // Square
    linkedin: { width: 1200, height: 627 },    // Landscape
    twitter: { width: 1200, height: 675 },     // Landscape  
    youtube: { width: 1280, height: 720 }      // Thumbnail
  };
  
  const size = dimensions[platform] || dimensions.instagram;
  
  // Update URL dimensions
  const optimizedUrl = imageUrl.replace(
    /width=\d+&height=\d+/,
    `width=${size.width}&height=${size.height}`
  );
  
  console.log(`📐 Optimized for ${platform}: ${size.width}x${size.height}`);
  return optimizedUrl;
}

// Validate image URL
export function isValidImageUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export default {
  generateImage,
  preloadImage,
  downloadImage,
  optimizeImageForPlatform,
  isValidImageUrl
};