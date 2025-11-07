import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { encryptApiKey, decryptApiKey, validateApiKeyFormat } from "./encryptionService";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Save a user's encrypted API key in Firestore
 */
export async function saveUserApiKey(userId, apiKey) {
  const { valid, error } = validateApiKeyFormat(apiKey);
  if (!valid) return { success: false, error };

  try {
    const encryptedKey = encryptApiKey(apiKey);
    await setDoc(doc(db, "users", userId), {
      encryptedApiKey: encryptedKey,
      createdAt: new Date().toISOString(),
    });

    console.log("✅ API key saved successfully for user:", userId);
    return { success: true };
  } catch (err) {
    console.error("❌ Error saving API key:", err);
    return { success: false, error: "Failed to save API key." };
  }
}

/**
 * Retrieve and decrypt the user's API key
 */
export async function getUserApiKey(userId) {
  try {
    const docRef = doc(db, "users", userId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return { success: false, error: "No API key found for this user." };
    }

    const encryptedKey = snapshot.data().encryptedApiKey;
    const decryptedKey = decryptApiKey(encryptedKey);

    if (!decryptedKey) throw new Error("Failed to decrypt API key.");
    return { success: true, apiKey: decryptedKey };
  } catch (err) {
    console.error("❌ Error fetching API key:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Verify whether a user's provided API key is valid
 * Supports fallback from Gemini 2.5 → 1.5 if necessary
 */
export async function verifyUserApiKey(apiKey) {
  const { valid, error } = validateApiKeyFormat(apiKey);
  if (!valid) return { success: false, error };

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Try Gemini 2.5 first
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      const test = await model.generateContent("Test");
      if (test.response && test.response.text()) {
        console.log("✅ API key verified for gemini-2.5-pro");
        return { success: true };
      }
    } catch (primaryError) {
      console.warn("⚠️ gemini-2.5-pro verification failed:", primaryError.message);

      // Fallback to Gemini 1.5-pro
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const fallbackTest = await fallbackModel.generateContent("Test");
      if (fallbackTest.response && fallbackTest.response.text()) {
        console.log("✅ API key verified for gemini-1.5-pro (fallback)");
        return { success: true };
      }
    }

    return { success: false, error: "Could not verify API key. Try regenerating it in Google AI Studio." };
  } catch (err) {
    console.error("❌ API key verification error:", err);
    return { success: false, error: "Verification failed. Please check your key." };
  }
}

/**
 * Update API key status (for tracking usage/errors)
 */
export async function updateApiKeyStatus(userId, status, reason = "") {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      apiKeyStatus: status,
      apiKeyStatusReason: reason,
      updatedAt: new Date().toISOString(),
    });
    console.log(`✅ API key status updated to "${status}"`);
    return { success: true };
  } catch (err) {
    console.error("❌ Failed to update API key status:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Export for named + default imports
 */
export default {
  saveUserApiKey,
  getUserApiKey,
  verifyUserApiKey,
  updateApiKeyStatus,
};
