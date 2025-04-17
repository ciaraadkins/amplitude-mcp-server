#!/bin/bash
# Installation script for Amplitude MCP server

echo "Installing dependencies..."
npm install

# Make scripts executable
chmod +x test.sh
chmod +x claude_setup.sh

# Make the index.js file executable
chmod +x index.js

echo "Installation complete!"
echo ""
echo "To test the server, run:"
echo "  ./test.sh YOUR_AMPLITUDE_API_KEY"
echo ""
echo "To configure with Claude Desktop, run:"
echo "  ./claude_setup.sh YOUR_AMPLITUDE_API_KEY"
echo ""
echo "For more information, see README.md and examples.md"
