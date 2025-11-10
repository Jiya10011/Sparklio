// services/userApiKeyService.js

import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Save user's API key to Firebase
export const saveUserApiKey = async (userId, apiKey) => {
  try {
    console.log('💾 Saving API key for user:', userId);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('API key is required');
    }

    // Reference to user's API key document
    const userKeyRef = doc(db, 'userApiKeys', userId);

    // Save with timestamp
    await setDoc(userKeyRef, {
      apiKey: apiKey.trim(),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }, { merge: true });

    console.log('✅ API key saved successfully');
    
    // Verify it was saved by reading it back
    const verification = await getDoc(userKeyRef);
    if (!verification.exists()) {
      throw new Error('Failed to verify API key save');
    }

    return { 
      success: true,
      message: 'API key saved successfully'
    };

  } catch (error) {
    console.error('❌ Error saving API key:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to save API key'
    };
  }
};

// Get user's API key from Firebase
export const getUserApiKey = async (userId) => {
  try {
    console.log('🔍 Getting API key for user:', userId);
    
    if (!userId) {
      console.warn('⚠️ No user ID provided');
      return { success: false, key: null };
    }

    const userKeyRef = doc(db, 'userApiKeys', userId);
    const docSnap = await getDoc(userKeyRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const apiKey = data.apiKey;
      
      if (apiKey && apiKey.trim().length > 0) {
        console.log('✅ API key found for user');
        return { 
          success: true, 
          key: apiKey.trim() 
        };
      } else {
        console.warn('⚠️ API key exists but is empty');
        return { success: false, key: null };
      }
    } else {
      console.log('ℹ️ No API key found for user');
      return { success: false, key: null };
    }

  } catch (error) {
    console.error('❌ Error getting API key:', error);
    return { 
      success: false, 
      key: null,
      error: error.message 
    };
  }
};

// Delete user's API key
export const deleteUserApiKey = async (userId) => {
  try {
    console.log('🗑️ Deleting API key for user:', userId);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userKeyRef = doc(db, 'userApiKeys', userId);
    await setDoc(userKeyRef, {
      apiKey: '',
      deletedAt: new Date().toISOString()
    }, { merge: true });

    console.log('✅ API key deleted successfully');
    return { success: true };

  } catch (error) {
    console.error('❌ Error deleting API key:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

export default {
  saveUserApiKey,
  getUserApiKey,
  deleteUserApiKey
};