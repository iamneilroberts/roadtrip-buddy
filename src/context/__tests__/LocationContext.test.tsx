import { render, screen, act, waitFor } from '@testing-library/react';
import { LocationProvider, useLocation } from '../LocationContext';
import { getCurrentPosition, watchPosition } from '../../api/geolocation';

// Mock the geolocation API
jest.mock('../../api/geolocation');

// Create a test component that uses the location context
const TestComponent = () => {
  const { 
    currentLocation, 
    destination, 
    error, 
    isLoading, 
    isWatching,
    startWatching,
    stopWatching,
    setDestination,
    isSimulating,
    simulationSpeed,
    startSimulation,
    stopSimulation
  } = useLocation();

  return (
    <div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="watching-state">{isWatching ? 'Watching' : 'Not Watching'}</div>
      <div data-testid="simulating-state">{isSimulating ? 'Simulating' : 'Not Simulating'}</div>
      <div data-testid="simulation-speed">{simulationSpeed}</div>
      
      {currentLocation && (
        <div data-testid="current-location">
          {currentLocation.lat}, {currentLocation.lng}
        </div>
      )}
      
      {destination && (
        <div data-testid="destination">
          {destination.lat}, {destination.lng}
        </div>
      )}
      
      {error && (
        <div data-testid="error">{error.message}</div>
      )}
      
      <button 
        data-testid="start-watching-btn" 
        onClick={startWatching}
      >
        Start Watching
      </button>
      
      <button 
        data-testid="stop-watching-btn" 
        onClick={stopWatching}
      >
        Stop Watching
      </button>
      
      <button 
        data-testid="set-destination-btn" 
        onClick={() => setDestination({ lat: 34.0522, lng: -118.2437, timestamp: Date.now() })}
      >
        Set Destination
      </button>
      
      <button 
        data-testid="start-simulation-btn" 
        onClick={() => {
          const mockRoute = [
            { lat: 37.7749, lng: -122.4194, timestamp: Date.now() },
            { lat: 37.7750, lng: -122.4195, timestamp: Date.now() },
            { lat: 37.7751, lng: -122.4196, timestamp: Date.now() }
          ];
          startSimulation(mockRoute, 2);
        }}
      >
        Start Simulation
      </button>
      
      <button 
        data-testid="stop-simulation-btn" 
        onClick={stopSimulation}
      >
        Stop Simulation
      </button>
    </div>
  );
};

describe('LocationContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock implementation for getCurrentPosition
    (getCurrentPosition as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        lat: 37.7749,
        lng: -122.4194,
        accuracy: 10,
        timestamp: Date.now()
      });
    });
    
    // Mock implementation for watchPosition
    (watchPosition as jest.Mock).mockImplementation((onSuccess) => {
      onSuccess({
        lat: 37.7749,
        lng: -122.4194,
        accuracy: 10,
        timestamp: Date.now()
      });
      return jest.fn(); // Return a cleanup function
    });
  });
  
  it('should initialize with default values', async () => {
    await act(async () => {
      render(
        <LocationProvider>
          <TestComponent />
        </LocationProvider>
      );
    });
    
    // Check initial states
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('watching-state')).toHaveTextContent('Not Watching');
    expect(screen.getByTestId('simulating-state')).toHaveTextContent('Not Simulating');
    expect(screen.getByTestId('simulation-speed')).toHaveTextContent('1');
    
    // getCurrentPosition should have been called
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    
    // Current location should be set
    await waitFor(() => {
      expect(screen.getByTestId('current-location')).toHaveTextContent('37.7749, -122.4194');
    });
  });
  
  it('should start and stop watching location', async () => {
    await act(async () => {
      render(
        <LocationProvider>
          <TestComponent />
        </LocationProvider>
      );
    });
    
    // Start watching
    await act(async () => {
      screen.getByTestId('start-watching-btn').click();
    });
    
    // Check that watching state is updated
    expect(screen.getByTestId('watching-state')).toHaveTextContent('Watching');
    expect(watchPosition).toHaveBeenCalledTimes(1);
    
    // Stop watching
    await act(async () => {
      screen.getByTestId('stop-watching-btn').click();
    });
    
    // Check that watching state is updated
    expect(screen.getByTestId('watching-state')).toHaveTextContent('Not Watching');
  });
  
  it('should set destination', async () => {
    await act(async () => {
      render(
        <LocationProvider>
          <TestComponent />
        </LocationProvider>
      );
    });
    
    // Set destination
    await act(async () => {
      screen.getByTestId('set-destination-btn').click();
    });
    
    // Check that destination is set
    expect(screen.getByTestId('destination')).toHaveTextContent('34.0522, -118.2437');
  });
  
  it('should handle geolocation errors', async () => {
    // Mock getCurrentPosition to throw an error
    (getCurrentPosition as jest.Mock).mockImplementation(() => {
      return Promise.reject({
        code: 1,
        message: 'Permission denied'
      });
    });
    
    await act(async () => {
      render(
        <LocationProvider>
          <TestComponent />
        </LocationProvider>
      );
    });
    
    // Wait for the error to be processed
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Check that error is displayed
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Permission denied');
    });
  });
  
  it('should start and stop simulation', async () => {
    // Mock setInterval and clearInterval
    const originalSetInterval = window.setInterval;
    const originalClearInterval = window.clearInterval;
    
    window.setInterval = jest.fn().mockReturnValue(123) as any;
    window.clearInterval = jest.fn() as any;
    
    await act(async () => {
      render(
        <LocationProvider>
          <TestComponent />
        </LocationProvider>
      );
    });
    
    // Start simulation
    await act(async () => {
      screen.getByTestId('start-simulation-btn').click();
    });
    
    // Check that simulation is started
    expect(screen.getByTestId('simulating-state')).toHaveTextContent('Simulating');
    expect(screen.getByTestId('simulation-speed')).toHaveTextContent('2');
    
    // Current location should be the first point in the route
    expect(screen.getByTestId('current-location')).toHaveTextContent('37.7749, -122.4194');
    
    // Stop simulation
    await act(async () => {
      screen.getByTestId('stop-simulation-btn').click();
    });
    
    // Check that simulation is stopped
    expect(screen.getByTestId('simulating-state')).toHaveTextContent('Not Simulating');
    
    // Restore original functions
    window.setInterval = originalSetInterval;
    window.clearInterval = originalClearInterval;
  });
});
