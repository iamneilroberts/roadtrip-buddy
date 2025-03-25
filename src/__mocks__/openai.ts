/**
 * Mock implementation of the OpenAI API for testing
 */
import { RecommendationResponse } from '../context/ChatContext';

// Default mock recommendation response
const defaultResponse: RecommendationResponse = {
  markdown: "# Test Recommendation\n\nThis is a test recommendation from the mock API.",
  json: {
    places: [
      {
        name: "Test Place",
        description: "A test place for unit testing",
        location: { lat: 37.7749, lng: -122.4194 }
      }
    ]
  }
};

// Mock implementation of getRecommendation
export const getRecommendation = jest.fn().mockImplementation(
  async (
    _query: string,
    _context: any,
    _mode: 'quick' | 'detailed',
    apiKey: string
  ): Promise<RecommendationResponse> => {
    // Validate API key
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    // Return mock response with slight delay to simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(defaultResponse);
      }, 100);
    });
  }
);

// Export the mock function
export default {
  getRecommendation
};
