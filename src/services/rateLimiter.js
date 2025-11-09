// src/services/rateLimiter.js
// Smart rate limiter to prevent hitting API quotas

class RateLimiter {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.requestsPerMinute = 50; // Stay under 60 limit
    this.dailyLimit = 1400; // Stay under 1500 limit
    this.requestTimestamps = [];
    this.dailyCount = this.getDailyCount();
    
    console.log('🎯 RateLimiter initialized:', {
      dailyCount: this.dailyCount,
      requestsPerMinute: this.requestsPerMinute,
      dailyLimit: this.dailyLimit
    });
  }

  // Get daily count from localStorage
  getDailyCount() {
    try {
      const today = new Date().toDateString();
      const stored = localStorage.getItem('api-daily-count');
      
      if (stored) {
        const data = JSON.parse(stored);
        if (data.date === today) {
          console.log('📊 Retrieved daily count:', data.count);
          return data.count;
        }
      }
      
      // New day, reset count
      console.log('🆕 New day detected, resetting count');
      localStorage.setItem('api-daily-count', JSON.stringify({ date: today, count: 0 }));
      return 0;
    } catch (error) {
      console.error('❌ Error getting daily count:', error);
      return 0;
    }
  }

  // Update daily count
  updateDailyCount() {
    try {
      const today = new Date().toDateString();
      this.dailyCount++;
      localStorage.setItem('api-daily-count', JSON.stringify({ 
        date: today, 
        count: this.dailyCount 
      }));
      console.log('✅ Daily count updated:', this.dailyCount);
    } catch (error) {
      console.error('❌ Error updating daily count:', error);
    }
  }

  // Check if we can make a request
  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean old timestamps (older than 1 minute)
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);
    
    // Check per-minute limit
    if (this.requestTimestamps.length >= this.requestsPerMinute) {
      return { allowed: false, reason: 'Per-minute limit reached. Wait 10 seconds.' };
    }
    
    // Check daily limit
    if (this.dailyCount >= this.dailyLimit) {
      return { 
        allowed: false, 
        reason: 'Daily limit reached (1400/1500). Resets at midnight PT. Use your own API key!' 
      };
    }
    
    return { allowed: true };
  }

  // Add request to queue
  async queueRequest(apiCall) {
    return new Promise((resolve, reject) => {
      this.queue.push({ apiCall, resolve, reject });
      this.processQueue();
    });
  }

  // Process queue with delays
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { allowed, reason } = this.canMakeRequest();
      
      if (!allowed) {
        console.warn('⏳ Rate limit:', reason);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
        continue;
      }
      
      const { apiCall, resolve, reject } = this.queue.shift();
      
      try {
        // Record timestamp
        this.requestTimestamps.push(Date.now());
        this.updateDailyCount();
        
        // Make API call
        const result = await apiCall();
        resolve(result);
        
        // Small delay between requests (1 second)
        await new Promise(r => setTimeout(r, 1000));
        
      } catch (error) {
        reject(error);
      }
    }
    
    this.processing = false;
  }

  // Get current usage stats
  getUsageStats() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = this.requestTimestamps.filter(t => t > oneMinuteAgo).length;
    
    const stats = {
      perMinute: {
        used: recentRequests,
        limit: this.requestsPerMinute,
        remaining: this.requestsPerMinute - recentRequests
      },
      daily: {
        used: this.dailyCount,
        limit: this.dailyLimit,
        remaining: this.dailyLimit - this.dailyCount,
        percentage: Math.round((this.dailyCount / this.dailyLimit) * 100)
      }
    };
    
    console.log('📊 Usage stats:', stats);
    return stats;
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Also export as default for flexibility
export default rateLimiter;