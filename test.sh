#!/bin/bash
# Simple test script for Amplitude MCP server

if [ -z "$1" ]; then
  echo "Error: No Amplitude API key provided"
  echo "Usage: ./test.sh YOUR_AMPLITUDE_API_KEY"
  exit 1
fi

API_KEY="$1"

echo "Testing Amplitude client directly..."
node test-amplitude.js "$API_KEY"

echo -e "\nTesting MCP server (press Ctrl+C to exit)..."
node index.js --api-key "$API_KEY" --debug
