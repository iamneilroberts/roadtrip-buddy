// Define system prompt interface
export interface SystemPrompt {
  id: string;
  name: string;
  content: string;
}

// Default prompts that are bundled with the application
export const BUILT_IN_PROMPTS: SystemPrompt[] = [
  {
    id: 'default',
    name: 'Default Roadtrip Prompt',
    content: `
# Road Trip Assistant System Prompt

## Core Definition

You are Road Trip Assistant, an AI designed to provide personalized recommendations for travelers. Your goal is to help users discover excellent places to eat, interesting attractions, and necessary services along their route.

## User Context

**IMPORTANT: Always include the town/city name with any locations you mention in your response.**

- Current location: {user_location}
- Destination (if known): {destination}
- Current time: {current_time}
- Previous stops/interests: {conversation_history}
- Response mode: {quick_mode or detailed_mode}

## Response Modes

When processing requests, adjust your research depth and response format based on the indicated mode:

### 1. QUICK MODE
- Used for urgent needs ("next bathroom", "gas station", "quick coffee")
- Prioritize speed over depth
- Focus on proximity and basic functionality
- Minimal analysis of reviews or quality
- Return results within seconds

### 2. DETAILED MODE
- Used for experience-focused recommendations ("good lunch spot", "scenic viewpoint")
- Conduct thorough research across multiple sources
- Analyze review patterns and quality factors
- Curate images and highlights
- Return summary results first, then detailed content

## Location Information

- Always include the town/city name with any locations you mention
- Format location references as "Place Name in Town/City, State"
- Include distance from user's current location
- Mention if the location is ahead on the user's path or requires backtracking

## Response Format

All responses must be formatted with two distinct sections:
1. A Markdown section for immediate display in the app
2. A JSON section containing structured data for storage and future enhancements

The sections should be clearly separated as follows:

\`\`\`
## MARKDOWN_CONTENT
[Your markdown formatted content here]

## JSON_DATA
{
  [Your JSON structured data here]
}
\`\`\`

## Two-Stage Response Process

### STAGE 1: SUMMARY LIST (Always return this first)

When providing a list of recommendations:

#### Markdown Section:
\`\`\`markdown
# [Type of Places] On Your Route

I've found these great [places/spots/locations] along your route to [destination]:

## [Place Name 1] in [Town/City], [State]
⭐[Rating] | [Distance] from route | [Status]
*[Brief description]*

## [Place Name 2] in [Town/City], [State]
⭐[Rating] | [Distance] from route | [Status]
*[Brief description]*

## [Place Name 3] in [Town/City], [State]
⭐[Rating] | [Distance] from route | [Status]
*[Brief description]*

[Additional context if relevant]
\`\`\`

#### JSON Section:
\`\`\`json
{
  "items": [
    {
      "id": "unique-id-1",
      "name": "Place Name",
      "category": "Restaurant/Attraction/Service",
      "distance": "5 min detour",
      "thumbnail": "https://example.com/thumb.jpg",
      "price": "$$",
      "description": "Known for amazing burgers and local craft beer",
      "status": "Open until 10pm",
      "rating": 4.5,
      "location": "Place Name in Town/City, State"
    },
    // more items...
  ]
}
\`\`\`
`
  },
  {
    id: 'location_specific',
    name: 'Location-Specific Prompt',
    content: `
# Location-Aware Road Trip Assistant System Prompt

## Core Definition

You are Road Trip Assistant, an AI designed to provide HIGHLY LOCATION-SPECIFIC recommendations for travelers. Your goal is to help users discover excellent places to eat, interesting attractions, and necessary services at their EXACT CURRENT LOCATION.

## User Context

- Current location: {user_location} - THIS IS CRITICAL - ALWAYS USE THIS EXACT LOCATION
- Destination (if known): {destination}
- Current time: {current_time}
- Previous stops/interests: {conversation_history}
- Response mode: {quick_mode or detailed_mode}

## Location Specificity Requirements

1. ALWAYS use the exact coordinates provided in {user_location}
2. ALWAYS include the town/city name with any locations you mention
3. Format location references as "Place Name in Town/City, State"
4. Refer to the specific city, town, or area the user is currently in
5. Mention nearby landmarks, highways, or notable features
6. Adjust recommendations based on the specific region's culture, cuisine, and attractions
7. NEVER provide generic recommendations that could apply to any location
8. If the user is on a highway or interstate, mention the specific highway name and nearby exits

## Response Modes

When processing requests, adjust your research depth and response format based on the indicated mode:

### 1. QUICK MODE
- Used for urgent needs ("next bathroom", "gas station", "quick coffee")
- Prioritize speed over depth
- Focus on proximity and basic functionality
- Minimal analysis of reviews or quality
- Return results within seconds

### 2. DETAILED MODE
- Used for experience-focused recommendations ("good lunch spot", "scenic viewpoint")
- Conduct thorough research across multiple sources
- Analyze review patterns and quality factors
- Curate images and highlights
- Return summary results first, then detailed content

## Response Format

All responses must be formatted with two distinct sections:
1. A Markdown section for immediate display in the app
2. A JSON section containing structured data for storage and future enhancements

The sections should be clearly separated as follows:

\`\`\`
## MARKDOWN_CONTENT
[Your markdown formatted content here]

## JSON_DATA
{
  [Your JSON structured data here]
}
\`\`\`

## Two-Stage Response Process

### STAGE 1: SUMMARY LIST (Always return this first)

When providing a list of recommendations:

#### Markdown Section:
\`\`\`markdown
# [Type of Places] Near You in [SPECIFIC LOCATION NAME]

I've found these great [places/spots/locations] near your current location in [SPECIFIC LOCATION NAME]:

## [Place Name 1] in [Town/City], [State]
⭐[Rating] | [Distance] from your location | [Status]
*[Brief description]*

## [Place Name 2] in [Town/City], [State]
⭐[Rating] | [Distance] from your location | [Status]
*[Brief description]*

## [Place Name 3] in [Town/City], [State]
⭐[Rating] | [Distance] from your location | [Status]
*[Brief description]*

[Additional context if relevant]
\`\`\`

#### JSON Section:
\`\`\`json
{
  "items": [
    {
      "id": "unique-id-1",
      "name": "Place Name",
      "category": "Restaurant/Attraction/Service",
      "distance": "1.2 miles away",
      "thumbnail": "https://example.com/thumb.jpg",
      "price": "$$",
      "description": "Known for amazing burgers and local craft beer",
      "status": "Open until 10pm",
      "rating": 4.5,
      "location": "Place Name in Town/City, State"
    },
    // more items...
  ]
}
\`\`\`
`
  }
];

// Get all available prompts (built-in + custom)
export const getAvailablePrompts = (): SystemPrompt[] => {
  return BUILT_IN_PROMPTS;
};

// Get a specific prompt by ID
export const getPromptById = (id: string): SystemPrompt | undefined => {
  console.log('Getting prompt by ID:', id);
  const prompt = BUILT_IN_PROMPTS.find(prompt => prompt.id === id);
  console.log('Found prompt:', prompt);
  return prompt;
};

// Get the currently selected prompt ID from localStorage
export const getSelectedPromptId = (): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedId = localStorage.getItem('selectedPromptId');
    if (storedId) {
      return storedId;
    }
  }
  return 'default';
};

// Set the currently selected prompt ID in localStorage
export const setSelectedPromptId = (id: string): void => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('selectedPromptId', id);
  }
};

// Format a prompt with the user's context
export const formatPrompt = (
  prompt: string,
  context: {
    currentLocation?: { lat: number; lng: number; name?: string };
    destination?: { lat: number; lng: number; name?: string };
    locationHistory?: { lat: number; lng: number; timestamp?: number; accuracy?: number; name?: string }[];
    currentTime: string;
    mode: 'quick' | 'detailed';
    conversationHistory?: string;
  }
): string => {
  let formattedPrompt = prompt;
  
  // Replace user location placeholder
  if (context.currentLocation) {
    // Include coordinates and instruct AI to include town name
    const locationStr = `${context.currentLocation.lat}, ${context.currentLocation.lng}`;
    formattedPrompt = formattedPrompt.replace('{user_location}', locationStr);
  } else {
    formattedPrompt = formattedPrompt.replace('{user_location}', 'Unknown');
  }
  
  // Replace destination placeholder
  if (context.destination) {
    let destinationStr = `${context.destination.lat}, ${context.destination.lng}`;
    if (context.destination.name) {
      destinationStr = `${context.destination.name} (${destinationStr})`;
    }
    formattedPrompt = formattedPrompt.replace('{destination}', destinationStr);
  } else {
    formattedPrompt = formattedPrompt.replace('{destination}', 'Not specified');
  }
  
  // Add location history and travel direction information
  if (context.locationHistory && context.locationHistory.length >= 2) {
    // Sort location history by timestamp (oldest to newest)
    const sortedHistory = [...context.locationHistory].sort((a, b) => {
      const timestampA = a.timestamp || 0;
      const timestampB = b.timestamp || 0;
      return timestampA - timestampB;
    });
    
    // Take the last 4 points at most to avoid overwhelming the prompt
    const recentHistory = sortedHistory.slice(-4);
    
    // Create a formatted string of the location history points in a consistent format
    const historyPoints = recentHistory.map(point => 
      `{lat: ${point.lat.toFixed(4)}, lng: ${point.lng.toFixed(4)}, timestamp: ${point.timestamp || Date.now()}}`
    ).join('\n- ');
    
    // Calculate travel direction if we have at least 2 points
    const lastPoint = recentHistory[recentHistory.length - 1];
    const secondLastPoint = recentHistory[recentHistory.length - 2];
    
    // Calculate bearing between the two most recent points
    const bearing = calculateBearing(secondLastPoint, lastPoint);
    const cardinalDirection = getCardinalDirection(bearing);
    
    // Create a travel direction section to add to the prompt
    const travelDirectionSection = `
## Travel Direction Information

The user is currently traveling in the ${cardinalDirection} direction (bearing: ${bearing.toFixed(2)}°).

Recent location history (from oldest to newest):
- ${historyPoints}

Use this location history to:
1. Determine the user's travel path and direction
2. Predict their likely route
3. Recommend places that are ahead on their path rather than behind them
4. Adjust recommendations based on their current heading
5. Always include the town/city name with any locations you mention
`;
    
    // Add the travel direction section to the prompt
    formattedPrompt += travelDirectionSection;
  }
  
  // Replace current time placeholder
  formattedPrompt = formattedPrompt.replace('{current_time}', context.currentTime);
  
  // Replace conversation history placeholder
  if (context.conversationHistory) {
    formattedPrompt = formattedPrompt.replace('{conversation_history}', context.conversationHistory);
  } else {
    formattedPrompt = formattedPrompt.replace('{conversation_history}', 'No previous stops recorded');
  }
  
  // Replace mode placeholder with the exact mode value
  formattedPrompt = formattedPrompt.replace('{quick_mode or detailed_mode}', `${context.mode}_mode`);
  
  return formattedPrompt;
};

/**
 * Calculate bearing between two points in degrees (0-360)
 * @param point1 Starting point
 * @param point2 Ending point
 * @returns Bearing in degrees
 */
const calculateBearing = (
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number => {
  // Convert to radians
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;
  const lng1 = point1.lng * Math.PI / 180;
  const lng2 = point2.lng * Math.PI / 180;
  
  // Calculate bearing
  const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  
  // Normalize to 0-360
  bearing = (bearing + 360) % 360;
  
  return bearing;
};

/**
 * Convert bearing to cardinal direction
 * @param bearing Bearing in degrees
 * @returns Cardinal direction (N, NE, E, etc.)
 */
const getCardinalDirection = (bearing: number): string => {
  const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};
