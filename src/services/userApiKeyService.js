import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { encryptApiKey, decryptApiKey, validateApiKeyFormat } from './encryptionService';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Test if API key works with Gemini
 */
async function testApiKey(apiKey) {
  try {
    console.log('🧪 Testing API key...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent("Say 'connected' if you can read this");
    const text = await result.response.text();
    
    if (text.toLowerCase().includes('connect')) {
      console.log('✅ API key test successful');
      return { valid: true };
    }
    
    return { valid: true }; // If response exists, key works
    
  } catch (error) {
    console.error('❌ API key test failed:', error);
    
    if (error.message.includes('API_KEY_INVALID') || error.message.includes('invalid')) {
      return { valid: false, error: 'Invalid API key. Please check your key.' };
    } else if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
      return { valid: true }; // Key is valid but quota exceeded (still save it)
    } else if (error.message.includes('billing')) {
      return { valid: false, error: 'Billing not enabled. Make sure API is enabled in Google Cloud.' };
    }
    
    return { valid: false, error: 'Could not verify API key. Please try again.' };
  }
}

/**
 * Save user's API key (encrypted)
 */
export async function saveUserApiKey(userId, apiKey) {
  try {
    console.log('💾 Saving API key for user:', userId);
    
    // Validate format
    const formatValidation = validateApiKeyFormat(apiKey);
    if (!formatValidation.valid) {
      return { success: false, error: formatValidation.error };
    }
    
    // Test if key works
    const testResult = await testApiKey(apiKey.trim());
    if (!testResult.valid) {
      return { success: false, error: testResult.error };
    }
    
    // Encrypt key
    const encryptedKey = encryptApiKey(apiKey.trim());
    
    // Save to Firestore
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      hasApiKey: true,
      apiKeyEncrypted: encryptedKey,
      apiKeyAddedAt: new Date().toISOString(),
      apiKeyLastTested: new Date().toISOString(),
      apiKeyStatus: 'active',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('✅ API key saved successfully');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Save API key error:', error);
    return { success: false, error: 'Failed to save API key. Please try again.' };
  }
}

/**
 * Get user's decrypted API key
 */
export async function getUserApiKey(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found', needsKey: true };
    }
    
    const userData = userDoc.data();
    
    if (!userData.hasApiKey || !userData.apiKeyEncrypted) {
      return { success: false, error: 'No API key configured', needsKey: true };
    }
    
    // Decrypt key
    const apiKey = decryptApiKey(userData.apiKeyEncrypted);
    
    return { 
      success: true, 
      apiKey,
      status: userData.apiKeyStatus || 'active'
    };
    
  } catch (error) {
    console.error('❌ Get API key error:', error);
    return { success: false, error: 'Failed to retrieve API key', needsKey: true };
  }
}

/**
 * Remove user's API key
 */
export async function removeUserApiKey(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      hasApiKey: false,
      apiKeyEncrypted: null,
      apiKeyStatus: 'removed',
      apiKeyRemovedAt: new Date().toISOString()
    });
    
    console.log('✅ API key removed');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Remove API key error:', error);
    return { success: false, error: 'Failed to remove API key' };
  }
}

/**
 * Update API key status
 */
export async function updateApiKeyStatus(userId, status, reason = '') {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      apiKeyStatus: status,
      apiKeyStatusReason: reason,
      apiKeyStatusUpdatedAt: new Date().toISOString()
    });
    
    console.log('✅ API key status updated:', status);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Update status error:', error);
    return { success: false };
  }
}

export default {
  saveUserApiKey,
  getUserApiKey,
  removeUserApiKey,
  updateApiKeyStatus
};