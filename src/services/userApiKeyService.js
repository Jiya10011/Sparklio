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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    const result = await model.generateContent("Say 'connected' if you can read this");
    const text = await result.response.text();
    
    if (text && text.toLowerCase().includes('connect')) {
      console.log('✅ API key test successful');
      return { valid: true };
    }

    // Even if the response doesn’t include "connect", if no error occurs, it’s valid
    return { valid: true };
    
  } catch (error) {
    console.error('❌ API key test failed:', error);

    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('invalid')) {
      return { valid: false, error: 'Invalid API key. Please check your key.' };
    } else if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      // Key is valid but daily quota exceeded
      return { valid: true, info: 'Quota exceeded but key is valid.' };
    } else if (error.message?.includes('billing')) {
      return { valid: false, error: 'Billing not enabled. Enable API in Google Cloud Console.' };
    }

    return { valid: false, error: 'Could not verify API key. Please try again.' };
  }
}

/**
 * Auto-create user document if missing
 */
async function ensureUserExists(userId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.log('🆕 Creating new user document for:', userId);
    await setDoc(userRef, {
      createdAt: new Date().toISOString(),
      hasApiKey: false,
      apiKeyStatus: 'none',
    });
  }

  return userRef;
}

/**
 * Save user's API key (encrypted)
 */
export async function saveUserApiKey(userId, apiKey) {
  try {
    console.log('💾 Saving API key for user:', userId);
    
    // Step 1: Ensure user document exists
    const userRef = await ensureUserExists(userId);
    
    // Step 2: Validate key format
    const formatValidation = validateApiKeyFormat(apiKey);
    if (!formatValidation.valid) {
      return { success: false, error: formatValidation.error };
    }
    
    // Step 3: Test key
    const testResult = await testApiKey(apiKey.trim());
    if (!testResult.valid) {
      return { success: false, error: testResult.error };
    }
    
    // Step 4: Encrypt key
    const encryptedKey = encryptApiKey(apiKey.trim());
    
    // Step 5: Save key to Firestore
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
    const userRef = await ensureUserExists(userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found', needsKey: true };
    }
    
    const userData = userDoc.data();
    
    if (!userData.hasApiKey || !userData.apiKeyEncrypted) {
      return { success: false, error: 'No API key configured', needsKey: true };
    }
    
    const apiKey = decryptApiKey(userData.apiKeyEncrypted);
    
    return { success: true, apiKey, status: userData.apiKeyStatus || 'active' };
    
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
    const userRef = await ensureUserExists(userId);
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
    const userRef = await ensureUserExists(userId);
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
