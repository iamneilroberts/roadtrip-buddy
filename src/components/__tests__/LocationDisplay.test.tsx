import { render, screen, fireEvent, act } from '../../test-utils';
import LocationDisplay from '../Map/LocationDisplay';

// Mock the useLocation hook to control its behavior
jest.mock('../../hooks/useLocation', () => ({
  useLocation: jest.fn().mockImplementation(() => ({
    currentLocation: {
      lat: 40.7128,
      lng: -74.0060,
      accuracy: 10,
      timestamp: Date.now(),
    },
    isWatching: false,
    isSimulating: false,
    error: undefined,
    isLoading: false,
    startWatching: jest.fn(),
    stopWatching: jest.fn(),
    startSimulation: jest.fn(),
    stopSimulation: jest.fn(),
  })),
}));

describe('LocationDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders location data correctly', async () => {
    await act(async () => {
      render(<LocationDisplay />);
    });

    // Check for the exact formatted values as they appear in the component
    expect(screen.getByText('Latitude:')).toBeInTheDocument();
    expect(screen.getByText('40.712800')).toBeInTheDocument();
    expect(screen.getByText('Longitude:')).toBeInTheDocument();
    expect(screen.getByText('-74.006000')).toBeInTheDocument();
    expect(screen.getByText('Accuracy:')).toBeInTheDocument();
    expect(screen.getByText('10.00 meters')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('handles start tracking button click', async () => {
    const mockStartWatching = jest.fn();
    
    // Override the default mock implementation for this test
    const useLocation = require('../../hooks/useLocation').useLocation;
    useLocation.mockImplementationOnce(() => ({
      currentLocation: {
        lat: 40.7128,
        lng: -74.0060,
        accuracy: 10,
        timestamp: Date.now(),
      },
      isWatching: false,
      isSimulating: false,
      error: undefined,
      isLoading: false,
      startWatching: mockStartWatching,
      stopWatching: jest.fn(),
      startSimulation: jest.fn(),
      stopSimulation: jest.fn(),
    }));
    
    await act(async () => {
      render(<LocationDisplay />);
    });

    const startButton = screen.getByText('Start Tracking');
    expect(startButton).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(startButton);
    });
    
    expect(mockStartWatching).toHaveBeenCalled();
  });

  it('renders stop tracking button when isWatching is true', async () => {
    const mockStopWatching = jest.fn();
    
    // Override the default mock implementation for this test
    const useLocation = require('../../hooks/useLocation').useLocation;
    useLocation.mockImplementationOnce(() => ({
      currentLocation: {
        lat: 40.7128,
        lng: -74.0060,
        accuracy: 10,
        timestamp: Date.now(),
      },
      isWatching: true, // Set to true to show the Stop Tracking button
      isSimulating: false,
      error: undefined,
      isLoading: false,
      startWatching: jest.fn(),
      stopWatching: mockStopWatching,
      startSimulation: jest.fn(),
      stopSimulation: jest.fn(),
    }));
    
    await act(async () => {
      render(<LocationDisplay />);
    });

    const stopButton = screen.getByText('Stop Tracking');
    expect(stopButton).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(stopButton);
    });
    
    expect(mockStopWatching).toHaveBeenCalled();
  });

  it('handles simulation toggle', async () => {
    // We don't need to mock startSimulation since we're just testing the toggle
    // to show/hide the simulation panel, not the actual simulation start
    
    await act(async () => {
      render(<LocationDisplay />);
    });

    const simulationButton = screen.getByText('Show Simulation');
    expect(simulationButton).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(simulationButton);
    });
    
    // After clicking, the simulation panel should be visible
    expect(screen.getByText('Location Simulation')).toBeInTheDocument();
  });

  it('displays error message when there is an error', async () => {
    // Override the default mock implementation for this test
    const useLocation = require('../../hooks/useLocation').useLocation;
    useLocation.mockImplementationOnce(() => ({
      currentLocation: null,
      isWatching: false,
      isSimulating: false,
      error: new Error('Geolocation is not supported by your browser'),
      isLoading: false,
      startWatching: jest.fn(),
      stopWatching: jest.fn(),
      startSimulation: jest.fn(),
      stopSimulation: jest.fn(),
    }));
    
    await act(async () => {
      render(<LocationDisplay />);
    });

    expect(screen.getByText('Geolocation is not supported by your browser')).toBeInTheDocument();
  });
});
