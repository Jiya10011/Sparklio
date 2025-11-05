import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Retry logic with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      
      if (isLastAttempt) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
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
    hashtagCount: "8-10 mix of popular (100K+) and niche (10-50K)",
    tone: "friendly, authentic, relatable, aesthetic"
  },
  linkedin: {
    hookStyle: "thought-provoking, professional, data-driven",
    captionLength: "4-5 sentences, value-focused with insights",
    hashtagCount: "3-5 professional, industry-specific hashtags",
    tone: "authoritative, insightful, professional, credible"
  },
  twitter: {
    hookStyle: "punchy, controversial, thread-worthy",
    captionLength: "2-3 sentences, concise and direct",
    hashtagCount: "2-3 trending, relevant hashtags",
    tone: "conversational, witty, direct, engaging"
  },
  youtube: {
    hookStyle: "curiosity-gap, clickable, benefit-driven",
    captionLength: "3-4 sentences with clear call-to-action",
    hashtagCount: "5-8 SEO-focused, searchable hashtags",
    tone: "engaging, enthusiastic, searchable, actionable"
  }
};

// Style-specific guidelines
const styleGuidelines = {
  minimal: "clean, simple, lots of white space, understated elegance, modern, less is more",
  bold: "high contrast, striking colors, dramatic, attention-grabbing, powerful, impactful",
  professional: "corporate, structured, credible, polished, business-ready, sophisticated",
  aesthetic: "dreamy, Pinterest-worthy, soft pastels, visually pleasing, artistic, curated",
  vibrant: "colorful, energetic, playful, dynamic, eye-catching, fun and lively"
};

// YouTube content type specifications
const youtubeContentTypes = {
  short: {
    format: "YouTube Short (60 seconds or less)",
    hookStyle: "Immediate attention grab, first 3 seconds critical",
    length: "Very concise, punchy, fast-paced"
  },
  title: {
    format: "Video Title",
    hookStyle: "Clickable, curiosity-gap, benefit-driven",
    length: "50-60 characters optimal"
  },
  description: {
    format: "Video Description",
    hookStyle: "SEO-optimized, informative, keyword-rich",
    length: "150-200 words with timestamps and links"
  },
  thumbnail: {
    format: "Thumbnail Concept",
    hookStyle: "Visual idea with text overlay suggestion",
    length: "Describe imagery, colors, text placement"
  }
};

// Fallback content generator
function generateFallbackContent(topic, platform, style) {
  const hooks = {
    instagram: `✨ ${topic} - here's what you need to know`,
    linkedin: `After researching ${topic}, here are the key insights:`,
    twitter: `Hot take on ${topic}: 🧵`,
    youtube: `Everything you need to know about ${topic}`
  };

  const captions = {
    instagram: `Sharing my journey with ${topic}. Swipe for insights! What's your experience? Drop a comment below 👇 Let's discuss!`,
    linkedin: `${topic} is becoming increasingly important in today's landscape. Here's what I've learned after extensive research and why it matters for your business growth.`,
    twitter: `Let's talk about ${topic}. Here's what most people completely miss (and why it matters)...`,
    youtube: `In this video, I'm breaking down ${topic} in a way that's easy to understand. Watch till the end for the best actionable tip!`
  };

  const topicWords = topic.toLowerCase().split(' ').slice(0, 2);
  const baseHashtags = [...topicWords, platform, style, 'content', 'socialmedia', 'viral', 'trending'];

  return {
    hook: hooks[platform] || hooks.instagram,
    caption: captions[platform] || captions.instagram,
    hashtags: baseHashtags.slice(0, 8),
    stylePrompt: `${style} style, ${platform} optimized, modern aesthetic, ${topic} themed, high quality visual`
  };
}

// Input validation
function validateInput(topic, platform) {
  // Check if topic exists
  if (!topic || typeof topic !== 'string') {
    throw new Error('Please enter a valid topic');
  }

  // Check minimum length
  const trimmedTopic = topic.trim();
  if (trimmedTopic.length < 5) {
    throw new Error('Topic must be at least 5 characters long');
  }

  // Check maximum length
  if (trimmedTopic.length > 100) {
    throw new Error('Topic must be under 100 characters');
  }

  // Block problematic content
  const blockedKeywords = [
    'illegal', 'hack', 'crack', 'pirate', 'cheat', 
    'scam', 'fraud', 'steal', 'weapon', 'drug'
  ];
  
  const lowerTopic = trimmedTopic.toLowerCase();
  
  for (const keyword of blockedKeywords) {
    if (lowerTopic.includes(keyword)) {
      throw new Error('Please choose a different topic - this content cannot be generated');
    }
  }

  // Validate platform
  const validPlatforms = ['instagram', 'linkedin', 'twitter', 'youtube'];
  if (!validPlatforms.includes(platform)) {
    throw new Error('Invalid platform selected');
  }

  return true;
}

// Main content generation function
export async function generateContent(topic, platform = 'instagram', style = 'minimal', youtubeType = 'short') {
  try {
    // Validate input first
    validateInput(topic, platform);

    console.log(`📝 Generating ${platform} content for: "${topic}" in ${style} style`);

    // Get guidelines
    const platformGuide = platformGuidelines[platform] || platformGuidelines.instagram;
    const styleGuide = styleGuidelines[style] || styleGuidelines.minimal;

    // Special handling for YouTube content types
    let additionalContext = '';
    if (platform === 'youtube') {
      const youtubeGuide = youtubeContentTypes[youtubeType] || youtubeContentTypes.short;
      additionalContext = `
YOUTUBE CONTENT TYPE: ${youtubeGuide.format}
- Format: ${youtubeGuide.hookStyle}
- Length: ${youtubeGuide.length}
`;
    }

    // Create comprehensive prompt
    const prompt = `You are an expert ${platform} content creator specializing in viral, engaging posts that drive real engagement.

TASK: Create highly engaging, platform-optimized content about "${topic}"

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

1. HOOK (Most Important):
   - Create a scroll-stopping opening line (1-2 sentences)
   - Use proven viral patterns (curiosity gaps, shocking statements, questions)
   - Must grab attention in first 3 seconds
   - Platform-appropriate tone
   - Make it irresistible to read more
   
2. CAPTION:
   - Write an engaging ${platform} caption (${platformGuide.captionLength})
   - Start with impact, maintain interest throughout
   - Include relevant details and insights
   - End with call-to-action or engaging question
   - Use natural, conversational language
   - Make it feel authentic, not robotic
   
3. HASHTAGS:
   - Provide exactly ${platformGuide.hashtagCount}
   - Mix: 40% popular (100K+ posts), 40% medium (10-50K), 20% niche (1-10K)
   - All must be relevant to topic and platform
   - No spaces in hashtag names
   - Research actual trending hashtags in this niche
   
4. STYLE PROMPT (for AI image generation):
   - Detailed visual description incorporating ${style} aesthetic
   - Describe mood, colors, composition, lighting
   - Platform-appropriate visuals (${platform} style)
   - Be specific and detailed for best AI image results

CRITICAL FORMATTING:
Return ONLY valid JSON in this EXACT format (no markdown, no extra text):

{
  "hook": "your compelling hook here",
  "caption": "your engaging caption here",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "stylePrompt": "detailed visual description here"
}

Remember: Quality over speed. Make this content truly engaging and valuable.`;

    // Generate content with retry logic
    const result = await retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-pro",
        generationConfig: {
          temperature: 0.9, // More creative
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
      // Remove any markdown code blocks if present
      let cleanedResult = result.trim();
      cleanedResult = cleanedResult.replace(/```json\n?/g, '');
      cleanedResult = cleanedResult.replace(/```\n?/g, '');
      cleanedResult = cleanedResult.trim();

      // Try to extract JSON from response
      const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('⚠️ No JSON found in response, using fallback');
        throw new Error('No JSON found in response');
      }
      
      content = JSON.parse(jsonMatch[0]);
      
      // Validate parsed content structure
      if (!content.hook || !content.caption || !content.hashtags || !content.stylePrompt) {
        console.warn('⚠️ Incomplete content structure, using fallback');
        throw new Error('Incomplete content structure');
      }

      // Validate hashtags is an array
      if (!Array.isArray(content.hashtags)) {
        console.warn('⚠️ Hashtags not an array, converting');
        content.hashtags = [];
      }

      // Clean hashtags (remove # symbol if present, trim whitespace)
      content.hashtags = content.hashtags
        .map(tag => tag.replace(/^#/, '').trim())
        .filter(tag => tag.length > 0); // Remove empty tags

      // Ensure minimum hashtag count
      if (content.hashtags.length < 3) {
        console.warn('⚠️ Too few hashtags, adding defaults');
        const defaults = [topic.split(' ')[0], platform, style, 'content', 'viral'];
        content.hashtags = [...content.hashtags, ...defaults].slice(0, 10);
      }

      console.log('✅ Content parsed and validated successfully');

    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.log('📦 Using fallback content');
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

    // Provide user-friendly error messages
    if (error.message.includes('API key') || error.message.includes('API_KEY')) {
      throw new Error('❌ API key error - please check your Gemini API key configuration');
    } else if (error.message.includes('quota') || error.message.includes('limit exceeded')) {
      throw new Error('⏰ Daily API limit reached - please try again tomorrow or use a different API key');
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      throw new Error('⏸️ Too many requests - please wait 30 seconds and try again');
    } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      throw new Error('🌐 Network error - please check your internet connection');
    } else if (error.message.includes('blocked') || error.message.includes('safety')) {
      throw new Error('🚫 Content filtered by AI safety systems - please try a different topic');
    } else if (error.message.length < 100 && !error.message.includes('undefined')) {
      // Use the original error message if it's short and meaningful
      throw error;
    } else {
      // Generic fallback error
      throw new Error('❌ Generation failed - please try again or try a different topic');
    }
  }
}

// Test API connection
export async function testConnection() {
  try {
    console.log('🔍 Testing Gemini API connection...');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent("Say 'connected' if you can read this");
    const text = await result.response.text();
    
    const isConnected = text.toLowerCase().includes('connected');
    console.log(isConnected ? '✅ API connection successful' : '⚠️ API responded but unclear');
    
    return isConnected;
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    return false;
  }
}

// Get API usage stats (if available)
export async function getApiStats() {
  // Note: Gemini doesn't provide usage stats via API
  // This is a placeholder for future implementation
  return {
    supported: false,
    message: 'Usage stats not available for Gemini API'
  };
}