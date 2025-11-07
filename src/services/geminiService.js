import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserApiKey, updateApiKeyStatus } from './userApiKeyService';

// Retry logic wrapper
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      
      if (isLastAttempt) {
        throw error;
      }
      
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`🔄 Retry attempt ${attempt + 1} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Platform-specific guidelines
const platformGuidelines = {
  instagram: {
    hookStyle: "visual, aspirational, use emojis sparingly",
    captionLength: "3-4 sentences, conversational and authentic",
    hashtagCount: "8-10 mix of popular and niche",
    tone: "friendly, authentic, relatable, aesthetic"
  },
  linkedin: {
    hookStyle: "thought-provoking, professional, data-driven",
    captionLength: "4-5 sentences, value-focused with insights",
    hashtagCount: "3-5 professional hashtags",
    tone: "authoritative, insightful, professional"
  },
  twitter: {
    hookStyle: "punchy, controversial, thread-worthy",
    captionLength: "2-3 sentences, concise and direct",
    hashtagCount: "2-3 trending hashtags",
    tone: "conversational, witty, direct"
  },
  youtube: {
    hookStyle: "curiosity-gap, clickable, benefit-driven",
    captionLength: "3-4 sentences with call-to-action",
    hashtagCount: "5-8 SEO-focused hashtags",
    tone: "engaging, enthusiastic, searchable"
  }
};

// Style guidelines
const styleGuidelines = {
  minimal: "clean, simple, lots of white space, understated elegance",
  bold: "high contrast, striking, dramatic, attention-grabbing",
  professional: "corporate, structured, credible, polished",
  aesthetic: "dreamy, Pinterest-worthy, soft, visually pleasing",
  vibrant: "colorful, energetic, playful, dynamic"
};

// YouTube content types
const youtubeContentTypes = {
  short: {
    format: "YouTube Short (60 seconds)",
    hookStyle: "Immediate grab, first 3 seconds critical",
    length: "Very concise, fast-paced"
  },
  title: {
    format: "Video Title",
    hookStyle: "Clickable, curiosity-gap",
    length: "50-60 characters"
  },
  description: {
    format: "Video Description",
    hookStyle: "SEO-optimized, keyword-rich",
    length: "150-200 words"
  },
  thumbnail: {
    format: "Thumbnail Concept",
    hookStyle: "Visual idea with text overlay",
    length: "Describe imagery and text"
  }
};

// Fallback content generator
function generateFallbackContent(topic, platform, style) {
  const hooks = {
    instagram: `✨ ${topic} - here's what you need to know`,
    linkedin: `After researching ${topic}, here are key insights:`,
    twitter: `Hot take on ${topic}: 🧵`,
    youtube: `Everything about ${topic}`
  };

  const captions = {
    instagram: `Sharing insights about ${topic}. What's your experience? Drop a comment! 👇`,
    linkedin: `${topic} is increasingly important. Here's what matters for your business.`,
    twitter: `Let's talk ${topic}. Here's what most people miss...`,
    youtube: `Breaking down ${topic} in an easy way. Watch till the end!`
  };

  const topicWords = topic.toLowerCase().split(' ').slice(0, 2);
  const baseHashtags = [...topicWords, platform, style, 'content', 'trending', 'viral'];

  return {
    hook: hooks[platform] || hooks.instagram,
    caption: captions[platform] || captions.instagram,
    hashtags: baseHashtags.slice(0, 8),
    stylePrompt: `${style} style, ${platform} optimized, modern aesthetic, ${topic} themed`
  };
}

// Input validation
function validateInput(topic, platform) {
  if (!topic || typeof topic !== 'string') {
    throw new Error('Please enter a valid topic');
  }

  const trimmedTopic = topic.trim();
  if (trimmedTopic.length < 5) {
    throw new Error('Topic must be at least 5 characters long');
  }

  if (trimmedTopic.length > 100) {
    throw new Error('Topic must be under 100 characters');
  }

  const blockedKeywords = ['illegal', 'hack', 'crack', 'pirate', 'weapon'];
  const lowerTopic = trimmedTopic.toLowerCase();
  
  for (const keyword of blockedKeywords) {
    if (lowerTopic.includes(keyword)) {
      throw new Error('Please choose a different topic');
    }
  }

  const validPlatforms = ['instagram', 'linkedin', 'twitter', 'youtube'];
  if (!validPlatforms.includes(platform)) {
    throw new Error('Invalid platform selected');
  }

  return true;
}

/**
 * Main content generation function
 * NOW USES USER'S PERSONAL API KEY!
 */
export async function generateContent(
  topic, 
  platform = 'instagram', 
  style = 'minimal', 
  youtubeType = 'short',
  userId = null // REQUIRED for user's API key
) {
  try {
    // Validate input
    validateInput(topic, platform);

    console.log(`📝 Generating ${platform} content for topic: "${topic}"`);

    // Get user's personal API key
    let apiKey;
    
    if (userId) {
      const keyResult = await getUserApiKey(userId);
      
      if (!keyResult.success) {
        if (keyResult.needsKey) {
          throw new Error('NEED_API_KEY'); // Special code to trigger modal
        }
        throw new Error(keyResult.error || 'Failed to get API key');
      }
      
      apiKey = keyResult.apiKey;
      console.log('🔑 Using user\'s personal API key');
      
    } else {
      // Fallback to default key (for testing only)
      apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      console.log('🔑 Using fallback API key');
    }

    // Initialize Gemini with user's key
    const genAI = new GoogleGenerativeAI(apiKey);

    // Get guidelines
    const platformGuide = platformGuidelines[platform] || platformGuidelines.instagram;
    const styleGuide = styleGuidelines[style] || styleGuidelines.minimal;

    // YouTube specific context
    let additionalContext = '';
    if (platform === 'youtube') {
      const youtubeGuide = youtubeContentTypes[youtubeType] || youtubeContentTypes.short;
      additionalContext = `
YOUTUBE CONTENT TYPE: ${youtubeGuide.format}
- Format: ${youtubeGuide.hookStyle}
- Length: ${youtubeGuide.length}
`;
    }

    // Build comprehensive prompt
    const prompt = `You are an expert ${platform} content creator specializing in viral, engaging posts.

TASK: Create platform-optimized content about "${topic}"

PLATFORM: ${platform.toUpperCase()}
Platform Guidelines:
- Hook style: ${platformGuide.hookStyle}
- Caption length: ${platformGuide.captionLength}
- Hashtag count: ${platformGuide.hashtagCount}
- Tone: ${platformGuide.tone}

STYLE: ${style.toUpperCase()}
Style Guidelines: ${styleGuide}
${additionalContext}

OUTPUT REQUIREMENTS:

1. HOOK (Critical):
   - Create scroll-stopping opening (1-2 sentences max)
   - Use proven viral patterns (curiosity gaps, shocking statements)
   - Platform-appropriate tone
   - Make it irresistible
   
2. CAPTION:
   - Write engaging ${platform} caption (${platformGuide.captionLength})
   - Start with impact, maintain interest
   - Include relevant details and insights
   - End with call-to-action or question
   - Natural, conversational language
   
3. HASHTAGS:
   - Provide exactly ${platformGuide.hashtagCount}
   - Mix: 40% popular (100K+), 40% medium (10-50K), 20% niche
   - All relevant to topic and platform
   - No spaces in hashtag names
   
4. STYLE PROMPT (for AI image generation):
   - Detailed visual description
   - Incorporate ${style} aesthetic
   - Describe mood, colors, composition
   - ${platform}-appropriate visuals

CRITICAL: Return ONLY valid JSON in this EXACT format (no markdown):

{
  "hook": "compelling hook here",
  "caption": "engaging caption here",
  "hashtags": ["tag1", "tag2", "tag3"],
  "stylePrompt": "detailed visual description here"
}`;

    // Generate with retry logic
    const result = await retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig: {
          temperature: 0.9,
          topP: 0.8,
          topK: 40,
        }
      });
      
      const response = await model.generateContent(prompt);
      const text = await response.response.text();
      
      console.log('✅ Gemini response received');
      return text;
    });

    // Parse JSON response
    let content;
    try {
      let cleanedResult = result.trim();
      cleanedResult = cleanedResult.replace(/```json\n?/g, '');
      cleanedResult = cleanedResult.replace(/```\n?/g, '');
      cleanedResult = cleanedResult.trim();

      const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('⚠️ No JSON found, using fallback');
        throw new Error('No JSON found');
      }
      
      content = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!content.hook || !content.caption || !content.hashtags || !content.stylePrompt) {
        console.warn('⚠️ Incomplete content, using fallback');
        throw new Error('Incomplete content');
      }

      // Clean hashtags
      if (!Array.isArray(content.hashtags)) {
        content.hashtags = [];
      }
      
      content.hashtags = content.hashtags
        .map(tag => tag.replace(/^#/, '').trim())
        .filter(tag => tag.length > 0);

      if (content.hashtags.length < 3) {
        const defaults = [topic.split(' ')[0], platform, style, 'content', 'viral'];
        content.hashtags = [...content.hashtags, ...defaults].slice(0, 10);
      }

      console.log('✅ Content parsed successfully');

    } catch (parseError) {
      console.error('❌ Parse error:', parseError);
      content = generateFallbackContent(topic, platform, style);
    }

    // Add metadata
    content.platform = platform;
    content.style = style;
    content.topic = topic;
    content.timestamp = new Date().toISOString();

    console.log('🎉 Content generation complete!');
    return content;

  } catch (error) {
    console.error('❌ Generation error:', error);

    // Handle special error codes
    if (error.message === 'NEED_API_KEY') {
      throw new Error('NEED_API_KEY'); // Pass through
    }
    
    // Check for quota exceeded
    if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
      if (userId) {
        await updateApiKeyStatus(userId, 'quota_exceeded', 'Daily quota reached');
      }
      throw new Error('⏰ Daily API quota reached. It resets at midnight Pacific Time.');
    }

    // Check for invalid key
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('invalid')) {
      if (userId) {
        await updateApiKeyStatus(userId, 'invalid', 'API key is invalid');
      }
      throw new Error('❌ Your API key is invalid. Please update it in settings.');
    }

    // Network errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('🌐 Network error - check your internet connection');
    }

    // Generic error
    throw new Error(error.message || '❌ Generation failed. Please try again.');
  }
}

// Test API connection
export async function testConnection() {
  try {
    console.log('🔍 Testing Gemini API connection...');
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return false;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent("Say 'connected'");
    const text = await result.response.text();
    
    const isConnected = text.toLowerCase().includes('connect');
    console.log(isConnected ? '✅ API connected' : '⚠️ API responded unclear');
    
    return isConnected;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}