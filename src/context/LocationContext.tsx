import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Location, GeolocationError, getCurrentPosition, watchPosition } from '../api/geolocation';

// Define the context state type
interface LocationContextState {
  currentLocation: Location | null;
  destination: Location | null;
  error: GeolocationError | null;
  isLoading: boolean;
  isWatching: boolean;
  setDestination: (destination: Location | null) => void;
  startWatching: () => void;
  stopWatching: () => void;
  // For simulation mode
  isSimulating: boolean;
  startSimulation: (route: Location[], speed: number, destination?: { lat: number, lng: number, name: string } | null) => void;
  stopSimulation: () => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  simulationProgress: number;
  // Location history for direction detection
  locationHistory: Location[];
  clearLocationHistory: () => void;
}

// Create the context with default values
const LocationContext = createContext<LocationContextState>({
  currentLocation: null,
  destination: null,
  error: null,
  isLoading: false,
  isWatching: false,
  setDestination: () => {},
  startWatching: () => {},
  stopWatching: () => {},
  isSimulating: false,
  startSimulation: () => {},
  stopSimulation: () => {},
  simulationSpeed: 1,
  setSimulationSpeed: () => {},
  simulationProgress: 0,
  locationHistory: [],
  clearLocationHistory: () => {},
});

// Props for the LocationProvider component
interface LocationProviderProps {
  children: ReactNode;
  maxHistoryLength?: number; // Maximum number of location points to keep in history
}

// LocationProvider component to wrap the app with location context
export const LocationProvider: React.FC<LocationProviderProps> = ({ 
  children, 
  maxHistoryLength = 10 // Default to keeping 10 location points
}) => {
  // State for location data
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  
  // State for location history
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);
  
  // State for simulation
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const simulationRoute = React.useRef<Location[]>([]);
  const simulationIndex = React.useRef<number>(0);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [simulationIntervalId, setSimulationIntervalId] = useState<number | null>(null);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);

  // Function to handle location errors
  const handleLocationError = (error: GeolocationError) => {
    setError(error);
    setIsLoading(false);
  };

  // Function to update location and history
  const updateLocation = (location: Location) => {
    setCurrentLocation(location);
    
    // Add to history if it's a new position (at least 10 meters from the last one)
    if (locationHistory.length === 0 || 
        calculateDistance(location, locationHistory[locationHistory.length - 1]) > 10) {
      setLocationHistory(prev => {
        const newHistory = [...prev, location];
        // Keep only the most recent locations up to maxHistoryLength
        return newHistory.slice(-maxHistoryLength);
      });
    }
  };

  // Calculate distance between two points in meters using Haversine formula
  const calculateDistance = (point1: Location, point2: Location): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Function to clear location history
  const clearLocationHistory = () => {
    setLocationHistory([]);
  };

  // Function to get the initial location
  useEffect(() => {
    if (!isSimulating && !isWatching) {
      setIsLoading(true);
      getCurrentPosition()
        .then((location) => {
          updateLocation(location);
          setError(null);
          setIsLoading(false);
        })
        .catch((error) => {
          handleLocationError(error);
        });
    }
  }, [isSimulating, isWatching]);

  // Function to start watching the location
  const startWatching = () => {
    if (isSimulating) {
      stopSimulation();
    }
    
    setIsLoading(true);
    setIsWatching(true);
    
    const stopWatchingFn = watchPosition(
      (location) => {
        updateLocation(location);
        setError(null);
        setIsLoading(false);
      },
      (error) => {
        handleLocationError(error);
        setIsWatching(false);
      }
    );
    
    // Store the stop function in a ref to use it later
    return () => {
      stopWatchingFn();
      setIsWatching(false);
    };
  };

  // Function to stop watching the location
  const stopWatching = () => {
    setIsWatching(false);
  };

  // Function to start simulation
  const startSimulation = (route: Location[], speed: number, destination?: { lat: number, lng: number, name: string } | null) => {
    if (isWatching) {
      stopWatching();
    }
    
    if (route.length === 0) {
      setError({
        code: 0,
        message: 'Cannot start simulation with an empty route'
      });
      return;
    }
    
    // Set destination if provided
    if (destination) {
      setDestination({
        lat: destination.lat,
        lng: destination.lng,
        timestamp: Date.now(),
        name: destination.name
      });
    } else if (route.length > 0) {
      // Use the last point in the route as the destination if none provided
      const lastPoint = route[route.length - 1];
      setDestination({
        ...lastPoint,
        name: lastPoint.name || `Destination (${lastPoint.lat.toFixed(4)}, ${lastPoint.lng.toFixed(4)})`
      });
    }
    
    simulationRoute.current = route;
    simulationIndex.current = 0;
    setSimulationProgress(0);
    setSimulationSpeed(speed);
    setIsSimulating(true);
    updateLocation(route[0]);
    
    // Start the simulation interval
    const intervalId = window.setInterval(() => {
      simulationIndex.current = (simulationIndex.current + 1);
      if (simulationIndex.current >= route.length) {
        // End of route, stop simulation
        stopSimulation();
        return;
      }
      
      // Update progress (0 to 1 scale)
      setSimulationProgress(simulationIndex.current / (route.length - 1));
      
      updateLocation(route[simulationIndex.current]);
    }, 1000 / speed) as unknown as number;
    
    setSimulationIntervalId(intervalId);
  };

  // Function to stop simulation
  const stopSimulation = () => {
    if (simulationIntervalId !== null) {
      window.clearInterval(simulationIntervalId);
      setSimulationIntervalId(null);
    }
    
    setIsSimulating(false);
    simulationRoute.current = [];
    simulationIndex.current = 0;
    setSimulationProgress(0);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalId !== null) {
        window.clearInterval(simulationIntervalId);
      }
    };
  }, [simulationIntervalId]);

  // Provide the context value
  const contextValue: LocationContextState = {
    currentLocation,
    destination,
    error,
    isLoading,
    isWatching,
    setDestination,
    startWatching,
    stopWatching,
    isSimulating,
    startSimulation,
    stopSimulation,
    simulationSpeed,
    setSimulationSpeed,
    simulationProgress,
    locationHistory,
    clearLocationHistory,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook to use the location context
export const useLocation = () => {
  return useContext(LocationContext);
};

export default LocationContext;
