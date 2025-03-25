import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '../hooks/useLocation';
import { useChat } from '../context/ChatContext';
import { Location } from '../api/geolocation';
import InteractiveMap from '../components/Map/InteractiveMap';
import { useDebug } from '../context/DebugContext';

const RouteSimulationPage: React.FC = () => {
  const { 
    startSimulation, 
    stopSimulation, 
    isSimulating, 
    currentLocation, 
    setSimulationSpeed,
    simulationProgress
  } = useLocation();
  
  const { sendMessage, clearMessages } = useChat();
  const { addLog } = useDebug();
  
  // State for route management
  const [customRoute, setCustomRoute] = useState<Location[]>([]);
  const [autoQuery, setAutoQuery] = useState<boolean>(false);
  const [queryInterval, setQueryInterval] = useState<number | null>(null);
  const [lastQueryPoint, setLastQueryPoint] = useState<number>(-1);
  const [speedInput, setSpeedInput] = useState<string>("0.5");
  const [destination, setDestination] = useState<{ lat: number, lng: number, name: string } | null>(null);
  
  // Map visualization reference
  const mapRef = useRef<HTMLIFrameElement>(null);
  const [mapHeight, setMapHeight] = useState<string>("400px");
  
  // State for showing/hiding the interactive map
  const [showInteractiveMap, setShowInteractiveMap] = useState<boolean>(false);
  
  // Load saved route from localStorage on component mount
  useEffect(() => {
    try {
      const savedRoute = localStorage.getItem('simulation_route');
      const savedDestination = localStorage.getItem('simulation_destination');
      
      if (savedRoute) {
        const parsedRoute = JSON.parse(savedRoute);
        if (Array.isArray(parsedRoute) && parsedRoute.length > 0) {
          setCustomRoute(parsedRoute);
          
          // Log route loaded from localStorage
          addLog({
            type: 'parsed',
            data: {
              title: 'Route Loaded',
              source: 'localStorage',
              points: parsedRoute.length,
              start: parsedRoute[0],
              end: parsedRoute[parsedRoute.length - 1]
            }
          });
        }
      }
      
      if (savedDestination) {
        const parsedDestination = JSON.parse(savedDestination);
        if (parsedDestination && parsedDestination.lat && parsedDestination.lng) {
          setDestination(parsedDestination);
        }
      }
    } catch (error) {
      console.error('Error loading saved route:', error);
    }
  }, []);
  
  // Auto-query effect
  useEffect(() => {
    if (autoQuery && isSimulating && currentLocation) {
      // Clear any existing interval
      if (queryInterval !== null) {
        clearInterval(queryInterval);
      }
      
      // Set up new interval
      const interval = window.setInterval(() => {
        // Only send a query if we've moved to a new location
        const currentIndex = customRoute.findIndex(
          loc => loc.lat === currentLocation.lat && loc.lng === currentLocation.lng
        );
        
        if (currentIndex !== -1 && currentIndex !== lastQueryPoint) {
          setLastQueryPoint(currentIndex);
          
          // Every 3rd point, send a query
          if (currentIndex % 3 === 0) {
            sendMessage(`What's interesting near my current location?`, 'quick');
          }
        }
      }, 2000);
      
      setQueryInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (!autoQuery && queryInterval !== null) {
      clearInterval(queryInterval);
      setQueryInterval(null);
    }
  }, [autoQuery, isSimulating, currentLocation, lastQueryPoint, customRoute, sendMessage]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (queryInterval !== null) {
        clearInterval(queryInterval);
      }
      if (isSimulating) {
        stopSimulation();
      }
    };
  }, [isSimulating, stopSimulation, queryInterval]);

  // Handle route generation from InteractiveMap
  const handleRouteGenerated = (points: Location[]) => {
    if (points.length > 0) {
      // Create a deep copy to avoid reference issues
      const pointsCopy = points.map(point => ({...point}));
      
      // Update state
      setCustomRoute(pointsCopy);
      
      // Save to localStorage
      localStorage.setItem('simulation_route', JSON.stringify(pointsCopy));
      
      // Set destination from the last point
      const lastPoint = pointsCopy[pointsCopy.length - 1];
      const destinationName = lastPoint.name || `Destination (${lastPoint.lat.toFixed(4)}, ${lastPoint.lng.toFixed(4)})`;
      
      const destinationObj = {
        lat: lastPoint.lat,
        lng: lastPoint.lng,
        name: destinationName
      };
      
      setDestination(destinationObj);
      localStorage.setItem('simulation_destination', JSON.stringify(destinationObj));
      
      // Hide the interactive map after route generation
      setShowInteractiveMap(false);
      
      // Log route generation
      addLog({
        type: 'parsed',
        data: {
          title: 'Route Generated',
          source: 'InteractiveMap',
          points: pointsCopy.length,
          start: pointsCopy[0],
          end: lastPoint,
          destination: destinationObj
        }
      });
    }
  };

  const handleStartSimulation = () => {
    clearMessages();
    setLastQueryPoint(-1);
    
    if (customRoute.length === 0) {
      alert('Please generate a route first');
      return;
    }
    
    // Parse the speed as a float
    const speed = parseFloat(speedInput);
    if (isNaN(speed) || speed <= 0) {
      alert('Please enter a valid simulation speed greater than 0');
      return;
    }
    
    // Update the context speed
    setSimulationSpeed(speed);
    
    // Log simulation start
    addLog({
      type: 'parsed',
      data: {
        title: 'Simulation Started',
        routePoints: customRoute.length,
        speed,
        destination
      }
    });
    
    // Start the simulation with the selected route
    startSimulation(customRoute, speed, destination);
    
    // Send initial message
    if (destination && destination.name) {
      sendMessage(`I'm heading to ${destination.name}. What should I know about this destination?`, 'quick');
    } else {
      sendMessage(`I'm starting a new journey. What should I look out for along the way?`, 'quick');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Route Simulation</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Route Selection</h2>
            
            <div className="mb-4">
              <button
                onClick={() => setShowInteractiveMap(!showInteractiveMap)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSimulating}
              >
                {showInteractiveMap ? 'Hide Map Creator' : 'Create New Route'}
              </button>
              
              {customRoute.length > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  Route created with {customRoute.length} points
                  {destination && ` to ${destination.name}`}
                </div>
              )}
            </div>
            
            {showInteractiveMap && (
              <div className="mb-4 border border-gray-200 rounded-lg p-3">
                <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                <div className="h-[400px]">
                  <InteractiveMap onRouteGenerated={handleRouteGenerated} />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Click on the map to set your start and end points, then click "Use This Route"
                </p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Name
              </label>
              <input
                type="text"
                value={destination?.name || ''}
                onChange={(e) => {
                  if (destination) {
                    const updatedDestination = {
                      ...destination,
                      name: e.target.value
                    };
                    setDestination(updatedDestination);
                    localStorage.setItem('simulation_destination', JSON.stringify(updatedDestination));
                  }
                }}
                placeholder="e.g. My Custom Destination"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSimulating}
              />
            </div>
            
            <div className="mt-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Simulation Speed
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={speedInput}
                  onChange={(e) => setSpeedInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSimulating}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Points per second (lower = slower)
                </p>
              </div>
              
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="autoQuery"
                  checked={autoQuery}
                  onChange={(e) => setAutoQuery(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoQuery" className="ml-2 block text-sm text-gray-900">
                  Auto-query interesting locations
                </label>
              </div>
              
              <div className="flex space-x-2">
                {!isSimulating ? (
                  <button
                    onClick={handleStartSimulation}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={customRoute.length === 0}
                  >
                    Start Simulation
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      stopSimulation();
                      addLog({
                        type: 'parsed',
                        data: {
                          title: 'Simulation Stopped',
                          progress: `${Math.round(simulationProgress * 100)}%`,
                          currentLocation
                        }
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Stop Simulation
                  </button>
                )}
                
                <button
                  onClick={() => setMapHeight(mapHeight === "400px" ? "600px" : "400px")}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {mapHeight === "400px" ? "Expand Map" : "Shrink Map"}
                </button>
              </div>
            </div>
          </div>
          
          {/* Current Location Display */}
          {currentLocation && (
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">Current Location</h2>
              <p className="mb-1">
                <span className="font-medium">Latitude:</span> {currentLocation.lat.toFixed(6)}
              </p>
              <p className="mb-1">
                <span className="font-medium">Longitude:</span> {currentLocation.lng.toFixed(6)}
              </p>
              {isSimulating && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.round(simulationProgress * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Simulation progress: {Math.round(simulationProgress * 100)}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Right column - Map and Chat */}
        <div className="lg:col-span-2 space-y-4">
          {/* Map */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Interactive Map</h2>
            <div className="relative w-full" style={{ height: mapHeight }}>
              <iframe
                ref={mapRef}
                className="absolute inset-0 w-full h-full border-0 rounded-md"
                loading="lazy"
                allowFullScreen
                title="Google Map"
              ></iframe>
            </div>
          </div>
          
          {/* Chat Interface */}
          {/* ... */}
        </div>
      </div>
    </div>
  );
};

export default RouteSimulationPage;
