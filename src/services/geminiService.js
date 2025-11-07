import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserApiKey, updateApiKeyStatus } from "./userApiKeyService";

/** Retry logic for temporary API/network errors */
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`🔁 Retry ${attempt + 1} in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

/** Platform-specific guidelines */
const platformGuidelines = {
  instagram: {
    hookStyle: "visual, aspirational, use emojis sparingly",
    captionLength: "3-4 sentences, conversational and authentic",
    hashtagCount: "8-10 mix of popular and niche",
    tone: "friendly, authentic, relatable, aesthetic",
  },
  linkedin: {
    hookStyle: "thought-provoking, professional, data-driven",
    captionLength: "4-5 sentences, value-focused with insights",
    hashtagCount: "3-5 professional hashtags",
    tone: "authoritative, insightful, professional",
  },
  twitter: {
    hookStyle: "punchy, controversial, thread-worthy",
    captionLength: "2-3 sentences, concise and direct",
    hashtagCount: "2-3 trending hashtags",
    tone: "conversational, witty, direct",
  },
  youtube: {
    hookStyle: "curiosity-gap, clickable, benefit-driven",
    captionLength: "3-4 sentences with call-to-action",
    hashtagCount: "5-8 SEO-focused hashtags",
    tone: "engaging, enthusiastic, searchable",
  },
};

/** Visual style guidelines */
const styleGuidelines = {
  minimal: "clean, simple, lots of white space, understated elegance",
  bold: "high contrast, striking, dramatic, attention-grabbing",
  professional: "corporate, structured, credible, polished",
  aesthetic: "dreamy, Pinterest-worthy, soft, visually pleasing",
  vibrant: "colorful, energetic, playful, dynamic",
};

/** YouTube content type guidance */
const youtubeContentTypes = {
  short: {
    format: "YouTube Short (60 seconds)",
    hookStyle: "Immediate grab, first 3 seconds critical",
    length: "Very concise, fast-paced",
  },
  title: {
    format: "Video Title",
    hookStyle: "Clickable, curiosity-gap",
    length: "50-60 characters",
  },
  description: {
    format: "Video Description",
    hookStyle: "SEO-optimized, keyword-rich",
    length: "150-200 words",
  },
  thumbnail: {
    format: "Thumbnail Concept",
    hookStyle: "Visual idea with text overlay",
    length: "Describe imagery and text",
  },
};

/** Basic fallback content if model fails */
function generateFallbackContent(topic, platform, style) {
  const hooks = {
    instagram: `✨ ${topic} — here's what you need to know`,
    linkedin: `After researching ${topic}, here are key insights:`,
    twitter: `Hot take on ${topic}: 🧵`,
    youtube: `Everything about ${topic}`,
  };

  const captions = {
    instagram: `Sharing insights about ${topic}. What's your experience? 👇`,
    linkedin: `${topic} is increasingly important. Here's what matters for your business.`,
    twitter: `Let's talk ${topic}. Here's what most people miss...`,
    youtube: `Breaking down ${topic} in an easy way. Watch till the end!`,
  };

  const baseHashtags = [topic.split(" ")[0], platform, style, "content", "viral", "trending"];
  return {
    hook: hooks[platform] || hooks.instagram,
    caption: captions[platform] || captions.instagram,
    hashtags: baseHashtags.slice(0, 8),
    stylePrompt: `${style} style, ${platform}-optimized visuals, ${topic} theme`,
  };
}

/** Input validation */
function validateInput(topic, platform) {
  if (!topic || typeof topic !== "string") throw new Error("Please enter a valid topic");
  const trimmed = topic.trim();
  if (trimmed.length < 5) throw new Error("Topic must be at least 5 characters long");
  if (trimmed.length > 100) throw new Error("Topic must be under 100 characters");

  const banned = ["illegal", "hack", "crack", "pirate", "weapon"];
  if (banned.some((k) => trimmed.toLowerCase().includes(k))) throw new Error("Please choose a different topic");

  const validPlatforms = ["instagram", "linkedin", "twitter", "youtube"];
  if (!validPlatforms.includes(platform)) throw new Error("Invalid platform selected");

  return true;
}

/** ✅ MAIN FUNCTION */
export async function generateContent(topic, platform = "instagram", style = "minimal", youtubeType = "short", userId = null) {
  try {
    validateInput(topic, platform);
    console.log(`🧠 Generating ${platform} content for "${topic}"`);

    // 🔑 Get user API key
    let apiKey;
    if (userId) {
      const keyResult = await getUserApiKey(userId);
      if (!keyResult.success) {
        if (keyResult.needsKey) throw new Error("NEED_API_KEY");
        throw new Error(keyResult.error || "Failed to get API key");
      }
      apiKey = keyResult.apiKey;
    } else {
      apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    }

    if (!apiKey) throw new Error("Missing API key");

    const genAI = new GoogleGenerativeAI(apiKey);

    const platformGuide = platformGuidelines[platform];
    const styleGuide = styleGuidelines[style];
    const ytGuide = platform === "youtube" ? youtubeContentTypes[youtubeType] : null;

    // 🧾 Create a clear structured prompt
    const prompt = `
You are an expert ${platform} content creator specializing in viral, engaging posts.
Create content about "${topic}"

Platform: ${platform.toUpperCase()}
Guidelines:
- Hook: ${platformGuide.hookStyle}
- Caption: ${platformGuide.captionLength}
- Hashtags: ${platformGuide.hashtagCount}
- Tone: ${platformGuide.tone}

Style: ${styleGuide}
${ytGuide ? `
YOUTUBE TYPE: ${ytGuide.format}
- ${ytGuide.hookStyle}
- ${ytGuide.length}` : ""}

Return JSON:
{
  "hook": "...",
  "caption": "...",
  "hashtags": ["tag1", "tag2", ...],
  "stylePrompt": "..."
}`;

    // 🧠 Generate content (with retry)
    const resultText = await retryWithBackoff(async () => {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-pro" });
      const response = await model.generateContent(prompt);
      return await response.response.text();
    });

    console.log("✅ Raw response:", resultText);

    // 🧩 Parse JSON safely
    let content;
    try {
      const clean = resultText.replace(/```json|```/g, "").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      content = jsonMatch ? JSON.parse(jsonMatch[0]) : generateFallbackContent(topic, platform, style);
    } catch (err) {
      console.warn("⚠️ JSON parse failed, using fallback:", err);
      content = generateFallbackContent(topic, platform, style);
    }

    if (!Array.isArray(content.hashtags)) content.hashtags = [];
    if (content.hashtags.length < 3) {
      const defaults = [topic.split(" ")[0], platform, style, "viral"];
      content.hashtags = [...content.hashtags, ...defaults].slice(0, 10);
    }

    return {
      ...content,
      platform,
      style,
      topic,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Generation error:", error);

    // Update Firestore status
    if (userId) {
      if (error.message.includes("quota") || error.message.includes("RESOURCE_EXHAUSTED"))
        await updateApiKeyStatus(userId, "quota_exceeded", "Daily quota reached");
      if (error.message.includes("API_KEY_INVALID") || error.message.includes("invalid"))
        await updateApiKeyStatus(userId, "invalid", "Invalid API key");
    }

    if (error.message === "NEED_API_KEY") throw error;

    // UI-friendly error messages
    if (error.message.includes("quota")) throw new Error("⏰ API quota reached. Resets at midnight PT.");
    if (error.message.includes("invalid")) throw new Error("❌ Invalid API key. Update it in settings.");
    if (error.message.includes("network")) throw new Error("🌐 Network error — check your connection");
    throw new Error(error.message || "❌ Generation failed. Try again.");
  }
}

/** ✅ Test connection */
export async function testConnection() {
  try {
    console.log("🔍 Testing Gemini API connection...");
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return false;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    const response = await model.generateContent("Say 'connected'");
    const text = await response.response.text();
    return text.toLowerCase().includes("connect");
  } catch (e) {
    console.error("❌ Connection test failed:", e);
    return false;
  }
}
