import CryptoJS from 'crypto-js';

const ENCRYPTION_SECRET = import.meta.env.VITE_ENCRYPTION_SECRET || 'sparklio-default-secret-change-this';

/**
 * Encrypt API key before storing
 */
export function encryptApiKey(apiKey) {
  try {
    const encrypted = CryptoJS.AES.encrypt(apiKey, ENCRYPTION_SECRET).toString();
    console.log('✅ API key encrypted');
    return encrypted;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypt API key for use
 */
export function decryptApiKey(encryptedKey) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Decryption failed');
    }
    
    console.log('✅ API key decrypted');
    return decrypted;
  } catch (error) {
    console.error('❌ Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Validate Gemini API key format
 */
export function validateApiKeyFormat(apiKey) {
  // Gemini API keys start with "AIza" and are 39 characters
  const geminiKeyPattern = /^AIza[a-zA-Z0-9_-]{35}$/;
  
  if (!apiKey || typeof apiKey !== 'string') {
    return { valid: false, error: 'API key is required' };
  }
  
  if (!geminiKeyPattern.test(apiKey.trim())) {
    return { 
      valid: false, 
      error: 'Invalid Gemini API key format. Keys should start with "AIza" and be 39 characters' 
    };
  }
  
  return { valid: true };
}

export default {
  encryptApiKey,
  decryptApiKey,
  validateApiKeyFormat
};