/**
 * Simple test script for Amplitude MCP client
 * 
 * Usage:
 * node test-amplitude.js YOUR_AMPLITUDE_API_KEY
 */

import { AmplitudeClient } from './amplitude-client.js';

async function runTest() {
  // Check if API key was provided
  if (process.argv.length < 3) {
    console.error('Please provide your Amplitude API key as an argument');
    console.error('Usage: node test-amplitude.js YOUR_AMPLITUDE_API_KEY');
    process.exit(1);
  }

  const apiKey = process.argv[2];
  console.log('Creating Amplitude client with API key:', apiKey);
  
  // Create Amplitude client
  const amplitude = new AmplitudeClient(apiKey);
  amplitude.setDebug(true);
  
  try {
    // Generate a unique test user ID
    const testUserId = `test_user_${Date.now()}`;
    console.log(`Test user ID: ${testUserId}`);
    
    // Test 1: Track a simple event
    console.log('\n🔍 Test 1: Tracking a simple event...');
    const result1 = await amplitude.trackEvent('test_event', testUserId, null, {
      test_property: 'test_value',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Success! Response:', result1);
    
    // Test 2: Track a page view
    console.log('\n🔍 Test 2: Tracking a page view...');
    const result2 = await amplitude.trackPageView('test_page', testUserId, null, {
      referrer: 'test_referrer'
    });
    console.log('✅ Success! Response:', result2);
    
    // Test 3: Set user properties
    console.log('\n🔍 Test 3: Setting user properties...');
    const result3 = await amplitude.setUserProperties(testUserId, {
      name: 'Test User',
      email: 'test@example.com',
      plan: 'test_plan'
    });
    console.log('✅ Success! Response:', result3);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('Check your Amplitude dashboard to verify the events have been recorded.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTest();
