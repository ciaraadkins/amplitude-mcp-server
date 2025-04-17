/**
 * AmplitudeClient for MCP
 * A simple Promise-based API client for Amplitude that works with their HTTP V2 API
 */

import https from 'https';

export class AmplitudeClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.endpoint = 'https://api2.amplitude.com/2/httpapi';
    this.debug = false;
  }

  /**
   * Enable debug logging
   */
  setDebug(debug) {
    this.debug = debug;
    return this;
  }
  
  /**
   * Internal logging function
   */
  log(...args) {
    if (this.debug) {
      console.error(`[${new Date().toISOString()}] [AmplitudeClient]`, ...args);
    }
  }

  /**
   * Make a request to the Amplitude HTTP V2 API
   */
  async makeRequest(events) {
    return new Promise((resolve, reject) => {
      // Prepare the request payload
      const payload = JSON.stringify({
        api_key: this.apiKey,
        events: events
      });

      // Prepare request options
      const options = {
        hostname: 'api2.amplitude.com',
        port: 443,
        path: '/2/httpapi',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      this.log('Sending request to Amplitude:', payload);
      
      // Create and send the request
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsedResponse = JSON.parse(responseData);
            this.log('Response from Amplitude:', parsedResponse);
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsedResponse);
            } else {
              reject(new Error(`HTTP Error: ${res.statusCode} - ${JSON.stringify(parsedResponse)}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        });
      });
      
      req.on('error', (e) => {
        this.log('Request error:', e);
        reject(e);
      });
      
      // Write data to request body
      req.write(payload);
      req.end();
    });
  }

  /**
   * Track an event in Amplitude
   */
  async trackEvent(eventType, userId = null, deviceId = null, eventProperties = {}, userProperties = {}) {
    // Validate that we have either a userId or deviceId
    if (!userId && !deviceId) {
      throw new Error("Either userId or deviceId must be provided");
    }
    
    // Make sure userId and deviceId are strings and meet minimum length requirements
    if (userId && typeof userId !== 'string') {
      userId = String(userId);
    }
    
    if (deviceId && typeof deviceId !== 'string') {
      deviceId = String(deviceId);
    }
    
    // Create event object
    const event = {
      event_type: eventType,
      time: Date.now(), // Current time in milliseconds
      insert_id: `${Date.now()}-${Math.random().toString(36).substring(2, 10)}` // Generate unique ID for deduplication
    };
    
    // Add user/device ID
    if (userId) {
      event.user_id = userId;
    }
    
    if (deviceId) {
      event.device_id = deviceId;
    }
    
    // Add properties if they exist
    if (Object.keys(eventProperties).length > 0) {
      event.event_properties = eventProperties;
    }
    
    if (Object.keys(userProperties).length > 0) {
      event.user_properties = userProperties;
    }
    
    // Send the event to Amplitude
    return this.makeRequest([event]);
  }

  /**
   * Track a page view event
   */
  async trackPageView(pageName, userId = null, deviceId = null, properties = {}) {
    return this.trackEvent('Page View', userId, deviceId, {
      page_name: pageName,
      ...properties
    });
  }

  /**
   * Set user properties
   */
  async setUserProperties(userId, properties = {}) {
    // In Amplitude, we set user properties by sending an identify event
    return this.trackEvent('$identify', userId, null, {}, {
      $set: properties
    });
  }

  /**
   * Track user signup
   */
  async trackSignup(userName, email, plan = 'free') {
    // Create deterministic ID from email
    const userId = `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    // First track signup event
    await this.trackEvent('Sign Up', userId, null, {
      plan: plan
    });
    
    // Then set user properties
    await this.setUserProperties(userId, {
      name: userName,
      email: email,
      plan: plan
    });
    
    return userId;
  }

  /**
   * Track revenue
   */
  async trackRevenue(userId, productId, price, quantity = 1, revenueType = null) {
    // Create revenue event
    const properties = {
      productId: productId,
      price: price,
      quantity: quantity,
      revenue: price * quantity // Calculated revenue
    };
    
    // Add revenue type if specified
    if (revenueType) {
      properties.revenueType = revenueType;
    }
    
    return this.trackEvent('Purchase', userId, null, properties);
  }
}
