# System Patterns: Roadtrip Buddy

## How the System is Built

### Architecture Overview
The Roadtrip Buddy application follows a component-based architecture using React with TypeScript. It's designed as a Progressive Web App (PWA) to enable offline capabilities and installability on mobile devices.

### Key Components

#### 1. Chat Interface
- Text-based chat UI for user interaction
- Displays AI-generated responses in markdown format
- Handles user input and context preservation

#### 2. Location System
- Tracks user location using Browser Geolocation API
- Maintains location history to determine travel direction
- Calculates bearing and cardinal direction based on recent positions
- Provides simulation capabilities for testing
- Maintains awareness of user's route and direction

#### 3. AI Integration
- Connects to OpenAI GPT-4o API
- Formats requests with user context (location, time, history, travel direction)
- Processes responses to extract markdown and JSON sections
- Utilizes travel direction information to provide more relevant recommendations

#### 4. Recommendation Display
- Renders markdown content for visual presentation
- Processes JSON data for structured information storage
- Handles both summary lists and detailed views
- Prioritizes recommendations based on user's travel direction

## Key Technical Decisions

### 1. Progressive Web App Approach
- **Decision**: Build as a PWA rather than a native mobile app
- **Rationale**: Faster development, cross-platform compatibility, no app store approval process
- **Implications**: Need to handle offline capabilities and browser limitations

### 2. TypeScript Implementation
- **Decision**: Use TypeScript from the beginning
- **Rationale**: Type safety, better developer experience, fewer runtime errors
- **Implications**: Additional setup time but better maintainability

### 3. Two-Mode Response System
- **Decision**: Implement both quick and detailed response modes
- **Rationale**: Different user needs during travel (urgent vs. planned stops)
- **Implications**: Need to handle different processing times and response formats

### 4. Location Simulation
- **Decision**: Create robust location simulation capabilities
- **Rationale**: Essential for testing without actual travel
- **Implications**: Additional development effort but crucial for effective testing

### 5. Markdown + JSON Response Format
- **Decision**: Dual-format responses with markdown for display and JSON for data
- **Rationale**: Combines rich visual presentation with structured data storage
- **Implications**: Need to parse and process both formats

### 6. Location History Tracking
- **Decision**: Maintain a history of recent locations rather than just current position
- **Rationale**: Enables travel direction detection and more relevant recommendations
- **Implications**: Additional state management and calculations, but improved user experience

### 7. Direction-Aware Recommendations
- **Decision**: Include travel direction in AI prompts
- **Rationale**: Helps AI prioritize recommendations that are ahead on the user's path
- **Implications**: More complex prompt engineering but more intuitive recommendations

## Architecture Patterns

### 1. Context-Provider Pattern
- React Context API for global state management
- LocationContext for geolocation data and history
- ChatContext for conversation history

### 2. Custom Hooks Pattern
- useLocation hook for geolocation functionality and history
- useChat hook for conversation management

### 3. Component Composition
- Smaller, focused components combined into larger features
- Clear separation of concerns between components

### 4. API Abstraction Layer
- Dedicated API modules for external services
- Centralized error handling and retry logic

### 5. Responsive Design Pattern
- Mobile-first approach
- Tailwind CSS for consistent styling
- Adaptable UI for different screen sizes and orientations

### 6. Geospatial Calculation Patterns
- Haversine formula for distance calculations between coordinates
- Bearing calculation to determine travel direction
- Cardinal direction mapping (N, NE, E, etc.) for human-readable directions

### 7. History-Based State Management
- Maintaining limited history of significant location changes
- Distance-based filtering to avoid redundant history entries
- Using history to derive additional context (direction, speed, etc.)
