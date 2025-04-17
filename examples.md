# Amplitude MCP Server Examples

This document provides practical examples of how to use the Amplitude MCP server with Claude Desktop and other MCP clients.

## Basic Claude Desktop Examples

Here are some example prompts you can use with Claude Desktop after setting up the Amplitude MCP server.

### Tracking a Simple Event

```
You: Can you track an event in Amplitude called "documentation_read" with the property "document_name" set to "user guide"?

Claude: I'll help you track that event in Amplitude. Let me use the tracking tool.

[Claude uses the amplitude_track_event tool]

Claude: Successfully tracked the "documentation_read" event in Amplitude with the document_name property set to "user guide".
```

### Tracking a Page View

```
You: Please track a page view in Amplitude for the pricing page. The user ID is "customer_xyz".

Claude: I'll track that page view in Amplitude for you.

[Claude uses the amplitude_track_pageview tool]

Claude: I've tracked a page view for the "pricing" page for user "customer_xyz" in Amplitude.
```

### Creating a User Profile

```
You: Create an Amplitude profile for our new user Jane Smith who signed up with jane@example.com for the premium plan.

Claude: I'll create that user profile in Amplitude right away.

[Claude uses the amplitude_track_signup tool]

Claude: Successfully created a profile for Jane Smith with email jane@example.com on the premium plan in Amplitude.
```

### Updating User Properties

```
You: Update the Amplitude profile for user "user_john_example_com" to set their company to "Acme Inc" and role to "Manager".

Claude: I'll update that user profile in Amplitude.

[Claude uses the amplitude_set_user_properties tool]

Claude: Successfully updated the Amplitude profile for user "user_john_example_com" with company set to "Acme Inc" and role set to "Manager".
```

### Tracking Revenue

```
You: Track a purchase in Amplitude for user "customer_xyz" who bought product "annual_subscription" for $299.99.

Claude: I'll track that revenue event in Amplitude.

[Claude uses the amplitude_track_revenue tool]

Claude: Successfully tracked revenue of $299.99 for user "customer_xyz" purchasing "annual_subscription".
```

## Advanced Usage Patterns

### Tracking Multiple Events in a Conversation

You can track multiple events throughout a conversation. For example:

```
You: Track that a user with ID "visitor_987" visited our homepage.

Claude: I've tracked the page view for the homepage.

You: Now they clicked on the signup button. Can you track that too?

Claude: I've tracked the "button_clicked" event with the button property set to "signup".

You: Great! Now they've completed signup with email user@example.com. Track that as a signup.

Claude: I've tracked the signup event and created a user profile for user@example.com.
```

### Tracking Conversion Funnel

You can track a user's journey through a conversion funnel:

```
You: I want to track a user's journey through our funnel. Start by tracking a page view for the landing page for user "prospect_123".

Claude: Tracked the page view for the landing page.

You: Now track that they viewed the product page.

Claude: Tracked the page view for the product page.

You: They added an item to their cart. Track that event.

Claude: Tracked the "add_to_cart" event.

You: Finally, they completed checkout with order ID 12345 and spent $129.99. Track that conversion.

Claude: Tracked the "purchase_completed" event with the order_id property set to 12345 and revenue of $129.99.
```

## Programmatic Usage (for Developers)

If you're building your own MCP client, you can call the Amplitude MCP server tools programmatically:

```javascript
// Example using the MCP client SDK
const client = new McpClient(/* your configuration */);
await client.initialize();

// Track an event
const result = await client.callTool({
  name: "track_event",
  arguments: {
    event_name: "button_clicked",
    user_id: "user123",
    properties: {
      button_id: "signup",
      page: "homepage"
    }
  }
});

console.log(result);
```

## Tips for Best Practices with Amplitude

1. **Use Consistent User IDs**: When possible, use the same `user_id` across events to build a coherent user journey.

2. **Add Context to Events**: Include relevant properties with each event to make your analytics more useful.

3. **Track Meaningful Events**: Focus on tracking events that provide actionable insights rather than tracking everything.

4. **Use Event Naming Conventions**: Follow a consistent naming convention for your events, such as `object_action` (e.g., "button_clicked", "form_submitted").

5. **Set User Properties Early**: Set important user properties when users first sign up to ensure comprehensive user data.

6. **Track Revenue Accurately**: When tracking purchases, ensure you set the correct price, quantity, and revenue_type for accurate revenue metrics.

7. **Follow Privacy Best Practices**: Always comply with privacy regulations and only track data you have permission to collect.

8. **Check Amplitude Dashboard**: Regularly check your Amplitude dashboard to ensure events are being tracked correctly.

## Usage with Business Intelligence

You can use the Amplitude MCP server to gain valuable business insights:

```
You: Can you track a feature usage event in Amplitude for user "customer_abc" who just used our new AI assistant feature?

Claude: I'll track that for you.

[Claude uses the Amplitude track_event tool]

Claude: I've tracked the "feature_used" event with the feature property set to "ai_assistant" for user "customer_abc".
```

## Integration with User Onboarding

Track key onboarding steps to analyze user activation:

```
You: Let's track onboarding progress for a new user. First, track that user "new_user_456" completed the account creation step.

Claude: Tracked the "onboarding_step_completed" event with step="account_creation".

You: Now track that they've completed the profile setup step.

Claude: Tracked the "onboarding_step_completed" event with step="profile_setup".

You: Finally, track that they've completed the tutorial.

Claude: Tracked the "onboarding_step_completed" event with step="tutorial_completed".
```

These examples should help you understand how to effectively use the Amplitude MCP server to track analytics events with Claude or other MCP clients.
