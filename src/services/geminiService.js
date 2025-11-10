import { getUserApiKey } from './userApiKeyService';

export const generateContent = async (topic, platform, style, youtubeType, userId) => {
  try {
    console.log('🚀 Starting content generation...');
    
    // --- START: HYBRID KEY LOGIC ---
    let apiKey = null;
    const userApiKey = await getUserApiKey(userId);
    
    if (userApiKey.success && userApiKey.key) {
      // 1. User is "Pro" - Use their personal key
      apiKey = userApiKey.key;
      console.log('✅ Using user-provided API key.');
    } else {
      // 2. User is "Free" - Use the environment key
      apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      console.log('✅ Using environment (freemium) API key.');
    }

    if (!apiKey) {
      console.error('❌ No API key is available. (User has no key AND VITE_GEMINI_API_KEY is not set)');
      throw new Error('API key configuration error. Please contact support.');
    }
    // --- END: HYBRID KEY LOGIC ---

    // Build prompt based on platform and style
    const prompt = buildPrompt(topic, platform, style, youtubeType);

    // Call Gemini API
    const response = await fetch(
      // --- THIS IS THE FIX ---
      // Changed 'v1beta' to 'v1' to match the 'gemini-pro' model
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      
      // Check for quota errors
      if (errorData.error?.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please check your Gemini API key quota at https://aistudio.google.com/');
      }
      
      throw new Error(errorData.error?.message || 'Failed to generate content');
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
      throw new Error('Invalid response from API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Parse the generated content
    const parsed = parseGeneratedContent(generatedText, platform);
    
    console.log('✅ Content generated successfully');
    return parsed;

  } catch (error) {
    console.error('❌ Generation error:', error);
    throw error;
  }
};

// Build prompt based on parameters
const buildPrompt = (topic, platform, style, youtubeType) => {
  const basePrompt = `Create engaging ${platform} content about: ${topic}

Style: ${style}
${platform === 'youtube' ? `Type: ${youtubeType}` : ''}

Generate:
1. Hook (attention-grabbing opening line)
2. Caption (engaging content body)
3. Hashtags (5-10 relevant hashtags)
4. Style Prompt (for image generation)

Format your response EXACTLY like this:

HOOK:
[Your hook here]

CAPTION:
[Your caption here]

HASHTAGS:
[#hashtag1, #hashtag2, #hashtag3, etc]

STYLE_PROMPT:
[Visual description for image generation]`;

  return basePrompt;
};

// Parse generated content
const parseGeneratedContent = (text, platform) => {
  const hookMatch = text.match(/HOOK:\s*\n(.*?)(?=\n\nCAPTION:|CAPTION:)/s);
  const captionMatch = text.match(/CAPTION:\s*\n(.*?)(?=\n\nHASHTAGS:|HASHTAGS:)/s);
  const hashtagsMatch = text.match(/HASHTAGS:\s*\n(.*?)(?=\n\nSTYLE_PROMPT:|STYLE_PROMPT:)/s);
  const stylePromptMatch = text.match(/STYLE_PROMPT:\s*\n(.*?)$/s);

  // Provide defaults in case regex fails
  const hook = hookMatch ? hookMatch[1].trim() : 'Could not generate hook.';
  const caption = captionMatch ? captionMatch[1].trim() : text.length > 100 ? text : 'Could not generate caption.';
  const hashtagsRaw = hashtagsMatch ? hashtagsMatch[1].trim() : '#sparklio #ai';
  const stylePrompt = stylePromptMatch ? stylePromptMatch[1].trim() : 'minimalist design';

  // Parse hashtags
  const hashtags = hashtagsRaw
    .split(/[,\n]/)
    .map(tag => tag.trim().replace(/^#/, ''))
    .filter(tag => tag.length > 0);

  return {
    hook,
    caption,
    hashtags,
    stylePrompt,
    platform
  };
};

export default { generateContent };