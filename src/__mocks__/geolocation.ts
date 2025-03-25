/**
 * Mock implementation of the geolocation API for testing
 */
import { Location, GeolocationError } from '../api/geolocation';

// Default mock location data
const defaultLocation: Location = {
  lat: 37.7749,
  lng: -122.4194,
  accuracy: 10,
  timestamp: Date.now()
};

// Mock implementation of getCurrentPosition
export const getCurrentPosition = jest.fn().mockImplementation(
  (): Promise<Location> => {
    return Promise.resolve(defaultLocation);
  }
);

// Mock implementation of watchPosition
export const watchPosition = jest.fn().mockImplementation(
  (
    onPositionChange: (location: Location) => void,
    _onError?: (error: GeolocationError) => void
  ): (() => void) => {
    // Immediately call the callback with the default location
    onPositionChange(defaultLocation);
    
    // Return a cleanup function
    return jest.fn();
  }
);

// Export the mock functions
export default {
  getCurrentPosition,
  watchPosition
};
