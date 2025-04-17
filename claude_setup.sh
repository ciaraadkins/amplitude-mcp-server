#!/bin/bash
# Setup script for Claude Desktop integration

if [ -z "$1" ]; then
  echo "Error: No Amplitude API key provided"
  echo "Usage: ./claude_setup.sh YOUR_AMPLITUDE_API_KEY"
  exit 1
fi

API_KEY="$1"
CONFIG_DIR="$HOME/Library/Application Support/Claude"
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

# Ensure config directory exists
mkdir -p "$CONFIG_DIR"

# Check if config file exists
if [ -f "$CONFIG_FILE" ]; then
  echo "Found existing Claude Desktop config file. Creating a backup..."
  cp "$CONFIG_FILE" "$CONFIG_FILE.bak"
  
  # Check if the file already has mcpServers configuration
  if grep -q "mcpServers" "$CONFIG_FILE"; then
    echo "Existing mcpServers configuration found. Adding Amplitude server..."
    # Use temp file for manipulation
    TMP_FILE=$(mktemp)
    
    # Use jq to add the new server if jq is available
    if command -v jq &> /dev/null; then
      jq --arg key "$API_KEY" '.mcpServers["amplitude-analytics"] = {
        "command": "node",
        "args": ["'"$PWD"'/index.js", "--api-key", $key]
      }' "$CONFIG_FILE" > "$TMP_FILE"
      mv "$TMP_FILE" "$CONFIG_FILE"
    else
      echo "Warning: jq not found. Please manually edit $CONFIG_FILE to add the Amplitude server."
      echo "Add the following to the mcpServers object:"
      echo '{
  "amplitude-analytics": {
    "command": "node",
    "args": ["'"$PWD"'/index.js", "--api-key", "'"$API_KEY"'"]
  }
}'
    fi
  else
    # No mcpServers config, create it
    echo "No mcpServers configuration found. Creating new configuration..."
    # Create temp file with new configuration
    TMP_FILE=$(mktemp)
    echo '{
  "mcpServers": {
    "amplitude-analytics": {
      "command": "node",
      "args": ["'"$PWD"'/index.js", "--api-key", "'"$API_KEY"'"]
    }
  }
}' > "$TMP_FILE"
    
    # Merge with existing config if it's a valid JSON
    if command -v jq &> /dev/null; then
      if jq empty "$CONFIG_FILE" 2>/dev/null; then
        jq -s '.[0] * .[1]' "$CONFIG_FILE" "$TMP_FILE" > "$CONFIG_FILE.new"
        mv "$CONFIG_FILE.new" "$CONFIG_FILE"
      else
        mv "$TMP_FILE" "$CONFIG_FILE"
      fi
    else
      mv "$TMP_FILE" "$CONFIG_FILE"
    fi
  fi
else
  # No config file, create a new one
  echo "Creating new Claude Desktop config file..."
  echo '{
  "mcpServers": {
    "amplitude-analytics": {
      "command": "node",
      "args": ["'"$PWD"'/index.js", "--api-key", "'"$API_KEY"'"]
    }
  }
}' > "$CONFIG_FILE"
fi

echo "Configuration complete! Please restart Claude Desktop to apply changes."
echo "Your Amplitude MCP server is now configured at: $PWD/index.js"
