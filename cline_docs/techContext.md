# Technical Context: Roadtrip Buddy

## Technologies Used

### Frontend
- **React 18.x** with TypeScript for the main application framework
- **Progressive Web App (PWA)** architecture with service workers for offline capabilities
- **Vite** as the build tool for better performance and simpler configuration
- **React Router 6.x** for navigation
- **react-markdown 8.x** for rendering markdown content
- **Tailwind CSS 3.x** for styling
- **Axios 1.x** for API requests
- **@tanstack/react-query 4.x** for data fetching and caching
- **date-fns 2.x** for date manipulation

### State Management
- **React Context** for app-wide state
- Potentially **Zustand 4.x** as a lightweight state management solution if needed

### APIs and Services
- **OpenAI API** (GPT-4o) integration for AI-powered responses
- **Browser Geolocation API** for tracking user position and movement
- Environment variables for API key management

### Geospatial Calculations
- **Haversine formula** for distance calculations between coordinates
- **Bearing calculations** for determining travel direction
- **Cardinal direction mapping** for human-readable direction information

## Development Setup
- TypeScript-based React application
- PWA configuration for installability and offline capabilities
- OpenAI API key required for AI functionality
- Location simulation capabilities for testing without actual movement

## Technical Constraints

### Performance Considerations
- Must operate efficiently on mobile devices
- Should function with varying network connectivity
- Real-time processing of location data required
- Quick response times needed for moving vehicles
- Efficient storage and processing of location history

### Data Requirements
- Structured data format (JSON) for all responses
- Consistent formatting for markdown content
- Image URL handling for recommendations
- Location data processing and route awareness
- Location history management with distance-based filtering
- Travel direction calculation based on recent positions

### User Experience Requirements
- Text chat interface (voice features planned for future)
- Content must be readable while in a moving vehicle
- Response length should adapt based on user's needs (quick vs. detailed)
- Information should be prioritized based on proximity, relevance, and travel direction
- Recommendations should favor locations ahead on the user's path

## Project Structure
```
src/
├── api/
│   ├── openai.ts           # OpenAI API integration with location history support
│   └── geolocation.ts
├── components/
│   ├── Chat/
│   ├── Map/
│   └── Recommendations/
├── context/
│   ├── LocationContext.tsx # Manages current location and location history
│   └── ChatContext.tsx     # Manages chat messages and passes location context to AI
├── hooks/
│   ├── useLocation.ts      # Custom hook for location functionality and history
│   └── useChat.ts
├── pages/
│   ├── HomePage.tsx
│   ├── ChatPage.tsx
│   └── RouteSimulationPage.tsx # For testing with simulated routes
├── types/
│   └── index.ts            # Includes Location type definitions
├── utils/
│   ├── locationUtils.ts    # Functions for geospatial calculations
│   ├── promptManager.ts    # Formats prompts with travel direction information
│   └── markdownUtils.ts
├── App.tsx
└── main.tsx
```

## Testing Strategy
- LocationSimulator component for testing without actual movement:
  - Selection of predefined routes
  - Manual position input
  - Simulated movement along routes with time controls
  - Saving/loading custom routes
  - Testing travel direction detection with various routes

## Location History Implementation
- **Storage**: Array of Location objects in LocationContext state
- **Filtering**: Only significant position changes (>10 meters) are stored
- **Size Management**: Limited to most recent positions (configurable)
- **Structure**:
  ```typescript
  interface Location {
    lat: number;
    lng: number;
    timestamp: number;
  }
  ```

## Travel Direction Detection
- **Bearing Calculation**: Uses the two most recent positions to calculate bearing in degrees
- **Cardinal Direction**: Maps bearing to 8-point compass directions (N, NE, E, SE, S, SW, W, NW)
- **Prompt Integration**: Travel direction information is included in the system prompt
- **AI Instructions**: The AI is instructed to prioritize recommendations ahead on the user's path

## OpenAI API Integration
- **Request Format**: Location history is included in the request payload
- **Context Structure**: Current location, destination, location history, and travel direction
- **Prompt Engineering**: Enhanced prompts with specific instructions for using travel direction
