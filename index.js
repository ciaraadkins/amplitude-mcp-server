#!/usr/bin/env node

/**
 * Amplitude MCP Server
 * A Model Context Protocol server for Amplitude analytics integration
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from "@modelcontextprotocol/sdk/types.js";
import { Command } from 'commander';
import { AmplitudeClient } from './amplitude-client.js';

// Parse command line arguments
const program = new Command();
program
  .name('amplitude-mcp-server')
  .description('MCP server for Amplitude analytics')
  .version('1.0.0')
  .requiredOption('--api-key <string>', 'Your Amplitude API key')
  .option('--debug', 'Enable debug mode for verbose logging', false)
  .parse();

const options = program.opts();
const amplitudeApiKey = options.apiKey;
const debug = options.debug;

// Debug logging function
function log(...args) {
  if (debug) {
    console.error(`[${new Date().toISOString()}]`, ...args);
  }
}

log(`Initializing Amplitude MCP server with API key: ${amplitudeApiKey.substring(0, 3)}...`);

// Tool definitions
const tools = [
  {
    name: "track_event",
    description: "Track a custom event in Amplitude",
    inputSchema: {
      type: "object",
      properties: {
        event_name: { 
          type: "string", 
          description: "Name of the event to track"
        },
        user_id: { 
          type: "string", 
          description: "User identifier (optional)"
        },
        device_id: { 
          type: "string", 
          description: "Device identifier (optional)"
        },
        properties: { 
          type: "object", 
          description: "Additional properties to track with the event (optional)"
        },
        user_properties: { 
          type: "object", 
          description: "User properties to update with this event (optional)"
        }
      },
      required: ["event_name"]
    }
  },
  {
    name: "track_pageview",
    description: "Track a page view event in Amplitude",
    inputSchema: {
      type: "object",
      properties: {
        page_name: { 
          type: "string", 
          description: "Name of the page viewed"
        },
        user_id: { 
          type: "string", 
          description: "User identifier (optional)"
        },
        device_id: { 
          type: "string", 
          description: "Device identifier (optional)"
        },
        properties: { 
          type: "object", 
          description: "Additional properties to track with the event (optional)"
        }
      },
      required: ["page_name"]
    }
  },
  {
    name: "track_signup",
    description: "Track a signup event and create a user profile",
    inputSchema: {
      type: "object",
      properties: {
        user_name: { 
          type: "string", 
          description: "User's full name"
        },
        email: { 
          type: "string", 
          description: "User's email address"
        },
        plan: { 
          type: "string", 
          description: "Signup plan (optional)"
        }
      },
      required: ["user_name", "email"]
    }
  },
  {
    name: "set_user_properties",
    description: "Update a user's profile properties in Amplitude",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { 
          type: "string", 
          description: "User identifier"
        },
        properties: { 
          type: "object", 
          description: "Profile properties to set"
        }
      },
      required: ["user_id", "properties"]
    }
  },
  {
    name: "track_revenue",
    description: "Track a revenue event in Amplitude",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { 
          type: "string", 
          description: "User identifier"
        },
        product_id: { 
          type: "string", 
          description: "Identifier for the product purchased"
        },
        price: { 
          type: "number", 
          description: "Price of the item purchased"
        },
        quantity: { 
          type: "number", 
          description: "Quantity of items purchased (defaults to 1)"
        },
        revenue_type: { 
          type: "string", 
          description: "Type of revenue (e.g., 'purchase', 'refund', 'subscription')"
        }
      },
      required: ["user_id", "product_id", "price"]
    }
  }
];

// Create MCP server
const server = new Server(
  {
    name: "amplitude-analytics",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize Amplitude client
const amplitude = new AmplitudeClient(amplitudeApiKey);
amplitude.setDebug(debug);

// Register tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  log('Received list_tools request');
  return { tools };
});

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    
    log(`Received call_tool request for: ${name}`);
    
    let result;
    
    switch (name) {
      case "track_event": {
        if (!args.event_name) {
          throw new Error("Missing required parameter: event_name");
        }
        
        const userId = args.user_id || null;
        const deviceId = args.device_id || null;
        const properties = args.properties || {};
        const userProperties = args.user_properties || {};
        
        // Must have either userId or deviceId
        if (!userId && !deviceId) {
          throw new Error("Either user_id or device_id must be provided");
        }
        
        log(`Tracking event: ${args.event_name} for user: ${userId || deviceId}`);
        
        await amplitude.trackEvent(
          args.event_name,
          userId,
          deviceId,
          properties,
          userProperties
        );
        
        result = `Successfully tracked event '${args.event_name}' for user '${userId || deviceId}'`;
        break;
      }
      
      case "track_pageview": {
        if (!args.page_name) {
          throw new Error("Missing required parameter: page_name");
        }
        
        const userId = args.user_id || null;
        const deviceId = args.device_id || null;
        const properties = args.properties || {};
        
        // Must have either userId or deviceId
        if (!userId && !deviceId) {
          throw new Error("Either user_id or device_id must be provided");
        }
        
        log(`Tracking pageview: ${args.page_name} for user: ${userId || deviceId}`);
        
        await amplitude.trackPageView(
          args.page_name,
          userId,
          deviceId,
          properties
        );
        
        result = `Successfully tracked page view for '${args.page_name}'`;
        break;
      }
      
      case "track_signup": {
        if (!args.user_name || !args.email) {
          throw new Error("Missing required parameters: user_name and email");
        }
        
        const plan = args.plan || 'free';
        
        log(`Tracking signup for: ${args.user_name} (${args.email}), plan: ${plan}`);
        
        const userId = await amplitude.trackSignup(args.user_name, args.email, plan);
        
        result = `Successfully tracked signup for '${args.user_name}' and created profile with ID '${userId}'`;
        break;
      }
      
      case "set_user_properties": {
        if (!args.user_id || !args.properties) {
          throw new Error("Missing required parameters: user_id and properties");
        }
        
        log(`Updating profile for user: ${args.user_id}`);
        
        await amplitude.setUserProperties(args.user_id, args.properties);
        
        result = `Successfully updated profile for user '${args.user_id}'`;
        break;
      }
      
      case "track_revenue": {
        if (!args.user_id || !args.product_id || args.price === undefined) {
          throw new Error("Missing required parameters: user_id, product_id, and price");
        }
        
        const quantity = args.quantity || 1;
        const revenueType = args.revenue_type || null;
        
        log(`Tracking revenue of ${args.price * quantity} for user: ${args.user_id}`);
        
        await amplitude.trackRevenue(
          args.user_id,
          args.product_id,
          args.price,
          quantity,
          revenueType
        );
        
        result = `Successfully tracked revenue of ${args.price * quantity} for user '${args.user_id}'`;
        break;
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    return {
      content: [{ type: "text", text: result }],
    };
  } catch (error) {
    log(`Error in call_tool: ${error.message}`);
    
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start the server
async function runServer() {
  try {
    // Create transport for stdio
    log('Initializing stdio transport');
    const transport = new StdioServerTransport();
    
    // Connect server to transport
    log('Starting MCP server...');
    await server.connect(transport);
    
    log('Amplitude MCP Server is running via stdio');
  } catch (error) {
    log(`Fatal error starting server: ${error.message}`);
    process.exit(1);
  }
}

// Handle errors and termination
process.on('SIGINT', () => {
  log('Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`);
  log(error.stack);
  process.exit(1);
});

// Run the server
runServer().catch((error) => {
  log(`Fatal error: ${error.message}`);
  log(error.stack);
  process.exit(1);
});
