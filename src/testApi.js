import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log('🔍 Testing API Key...');
console.log('API Key exists:', !!API_KEY);
console.log('API Key length:', API_KEY?.length);
console.log('API Key starts with:', API_KEY?.substring(0, 10));

async function testApi() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    const result = await model.generateContent("Say hello");
    const text = await result.response.text();
    
    console.log('✅ API Test SUCCESS:', text);
    return true;
  } catch (error) {
    console.error('❌ API Test FAILED:', error);
    return false;
  }
}

testApi();