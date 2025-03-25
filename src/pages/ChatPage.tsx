import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ChatContainer from '../components/Chat/ChatContainer';
import RecommendationDisplay from '../components/Recommendations/RecommendationDisplay';
import PromptSelector from '../components/Chat/PromptSelector';
import { useLocation } from '../hooks/useLocation';
import { Location } from '../api/geolocation';
import { getGoogleMapsApiKey } from '../utils/env';
import InteractiveMap from '../components/Map/InteractiveMap';

// Predefined routes for testing
const PREDEFINED_ROUTES: Record<string, Location[]> = {
  'I-95 NYC to Boston': [
    { lat: 40.7128, lng: -74.006, timestamp: Date.now() }, // NYC
    { lat: 40.9046, lng: -73.9143, timestamp: Date.now() + 1000 }, // Yonkers
    { lat: 41.0534, lng: -73.5387, timestamp: Date.now() + 2000 }, // Stamford, CT
    { lat: 41.3083, lng: -72.9279, timestamp: Date.now() + 3000 }, // New Haven, CT
    { lat: 41.7658, lng: -72.6734, timestamp: Date.now() + 4000 }, // Hartford, CT
    { lat: 42.1015, lng: -71.5829, timestamp: Date.now() + 5000 }, // Worcester, MA
    { lat: 42.3601, lng: -71.0589, timestamp: Date.now() + 6000 }, // Boston, MA
  ],
  'I-80 SF to Sacramento': [
    { lat: 37.7749, lng: -122.4194, timestamp: Date.now() }, // San Francisco
    { lat: 37.8044, lng: -122.2712, timestamp: Date.now() + 1000 }, // Oakland
    { lat: 38.0124, lng: -122.1341, timestamp: Date.now() + 2000 }, // Concord
    { lat: 38.1499, lng: -121.6957, timestamp: Date.now() + 3000 }, // Antioch
    { lat: 38.2821, lng: -121.3702, timestamp: Date.now() + 4000 }, // Lodi
    { lat: 38.5816, lng: -121.4944, timestamp: Date.now() + 5000 }, // Sacramento
  ],
  'I-66 DC to Front Royal': [
    { lat: 38.9072, lng: -77.0369, timestamp: Date.now() }, // Washington DC
    { lat: 38.8977, lng: -77.1776, timestamp: Date.now() + 1000 }, // Falls Church
    { lat: 38.8977, lng: -77.4291, timestamp: Date.now() + 2000 }, // Fairfax
    { lat: 38.7934, lng: -77.7079, timestamp: Date.now() + 3000 }, // Manassas
    { lat: 38.7512, lng: -77.8736, timestamp: Date.now() + 4000 }, // Gainesville
    { lat: 38.9159, lng: -78.1948, timestamp: Date.now() + 5000 }, // Front Royal
  ],
  'I-10 Mobile to Pensacola': [
    { lat: 30.6954, lng: -88.0399, timestamp: Date.now() }, // Mobile, AL
    { lat: 30.6770, lng: -87.9089, timestamp: Date.now() + 1000 }, // Daphne, AL
    { lat: 30.6690, lng: -87.7497, timestamp: Date.now() + 2000 }, // Loxley, AL
    { lat: 30.6465, lng: -87.5925, timestamp: Date.now() + 3000 }, // Robertsdale, AL
    { lat: 30.5595, lng: -87.3823, timestamp: Date.now() + 4000 }, // Lillian, AL
    { lat: 30.4846, lng: -87.2573, timestamp: Date.now() + 5000 }, // Pensacola, FL
  ],
  'I-65 Approaching Camden': [
    { lat: 32.3182, lng: -86.9023, timestamp: Date.now() }, // Montgomery, AL
    { lat: 32.2589, lng: -86.9839, timestamp: Date.now() + 1000 }, // Hope Hull, AL
    { lat: 32.1793, lng: -87.0736, timestamp: Date.now() + 2000 }, // Lowndesboro, AL
    { lat: 32.0643, lng: -87.1736, timestamp: Date.now() + 3000 }, // White Hall, AL
    { lat: 31.9798, lng: -87.2380, timestamp: Date.now() + 4000 }, // Benton, AL
    { lat: 31.8801, lng: -87.3010, timestamp: Date.now() + 5000 }, // Selma, AL (I-65 exit)
    { lat: 31.8468, lng: -87.3533, timestamp: Date.now() + 6000 }, // Heading west on AL-41
    { lat: 31.8135, lng: -87.4056, timestamp: Date.now() + 7000 }, // Approaching Camden
    { lat: 31.9914, lng: -87.2901, timestamp: Date.now() + 8000 }, // Camden, AL
  ],
};

const ChatPage: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showLocationPanel, setShowLocationPanel] = useState<boolean>(true);
  const [selectedRoute, setSelectedRoute] = useState<string>('I-65 Approaching Camden');
  const [speedInput, setSpeedInput] = useState<string>('0.05');
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [destinationName, setDestinationName] = useState<string>('');
  // Default to interactive mode to prioritize custom routes
  const [mapMode, setMapMode] = useState<'simple' | 'interactive'>('interactive');
  const [customRoutePoints, setCustomRoutePoints] = useState<Location[]>([]);
  const mapRef = useRef<HTMLIFrameElement>(null);

  const {
    currentLocation,
    isSimulating,
    startSimulation,
    stopSimulation,
    simulationProgress,
  } = useLocation();

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Update the map iframe when the current location changes
  useEffect(() => {
    if (currentLocation && mapRef.current) {
      const apiKey = getGoogleMapsApiKey();
      mapRef.current.src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${currentLocation.lat},${currentLocation.lng}&zoom=15`;
    }
  }, [currentLocation]);

  const handleRouteGenerated = (points: Location[]) => {
    console.log('Route generated in ChatPage:', points.length, 'points');
    // Make a deep copy of the points to ensure we don't have reference issues
    const pointsCopy = points.map(point => ({...point}));
    setCustomRoutePoints(pointsCopy);
    
    // Set destination name from the last point if available
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      if (lastPoint.name) {
        console.log('Setting destination name to:', lastPoint.name);
        setDestinationName(lastPoint.name);
      }
    }
  };

  const handleStartSimulation = () => {
    let routeToUse: Location[] = [];
    let destinationToUse: { lat: number; lng: number; name: string } | null = null;
    
    // Ensure speed is a valid number first
    const speed = parseFloat(speedInput);
    if (isNaN(speed) || speed <= 0) {
      alert('Please enter a valid simulation speed greater than 0');
      return;
    }
    
    console.log('Starting simulation with mapMode:', mapMode);
    console.log('Custom route points available:', customRoutePoints.length);
    
    // Prioritize custom route from interactive map if available
    if (mapMode === 'interactive' && customRoutePoints.length >= 2) {
      console.log('Using custom route from interactive map with', customRoutePoints.length, 'points');
      // Create a deep copy of the custom route points
      routeToUse = customRoutePoints.map(point => ({...point}));
      
      // Create destination object if destination name is provided
      if (destinationName) {
        destinationToUse = {
          lat: routeToUse[routeToUse.length - 1].lat,
          lng: routeToUse[routeToUse.length - 1].lng,
          name: destinationName
        };
        console.log('Using custom destination name:', destinationName);
      } else if (routeToUse[routeToUse.length - 1].name) {
        destinationToUse = {
          lat: routeToUse[routeToUse.length - 1].lat,
          lng: routeToUse[routeToUse.length - 1].lng,
          name: routeToUse[routeToUse.length - 1].name || 'Destination'
        };
        console.log('Using route end point name:', destinationToUse.name);
      }
    } else if (selectedRoute) {
      // Fallback to predefined route if no custom route is available
      console.log('Using predefined route:', selectedRoute);
      routeToUse = [...PREDEFINED_ROUTES[selectedRoute]];
      
      // Create destination object if destination name is provided
      if (destinationName) {
        destinationToUse = {
          lat: routeToUse[routeToUse.length - 1].lat,
          lng: routeToUse[routeToUse.length - 1].lng,
          name: destinationName
        };
      }
    }
    
    if (routeToUse.length < 2) {
      alert('Please select a valid route with at least 2 points');
      return;
    }
    
    console.log('Starting simulation with', routeToUse.length, 'points at speed', speed);
    console.log('First point:', routeToUse[0]);
    console.log('Last point:', routeToUse[routeToUse.length - 1]);
    
    // Ensure we're passing a fresh array to avoid reference issues
    startSimulation([...routeToUse], speed, destinationToUse);
  };

  const handleStopSimulation = () => {
    stopSimulation();
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeedInput(e.target.value);
  };

  const getLocationName = () => {
    if (!currentLocation) return "Unknown Location";
    
    // Find which route point we're closest to
    if (isSimulating && selectedRoute) {
      const routeNames = selectedRoute.split(' to ');
      
      if (simulationProgress < 0.25) {
        return `Near ${routeNames[0]}`;
      } else if (simulationProgress > 0.75) {
        return `Approaching ${routeNames[1] || 'destination'}`;
      } else {
        return `On ${selectedRoute.split(' ')[0]}`; // Show highway name
      }
    }
    
    return "Current Location";
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-white hover:text-blue-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold ml-4">Roadtrip Buddy Chat</h1>
          </div>
          <div className="flex items-center">
            {currentLocation && (
              <div className="mr-4 px-3 py-1 bg-blue-800 rounded-full text-sm">
                {getLocationName()} {isSimulating ? `(Simulated)` : ''}
              </div>
            )}
            <button
              onClick={() => setShowLocationPanel(!showLocationPanel)}
              className="px-3 py-1 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {showLocationPanel ? 'Hide Map & Controls' : 'Show Map & Controls'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Chat panel */}
        <div className="flex-grow flex flex-col h-full overflow-hidden">
          <div className="p-3 bg-white border-b">
            <PromptSelector onChange={(promptId) => {
              setSelectedPromptId(promptId);
              console.log(`ChatPage: Prompt changed to: ${promptId}`);
            }} />
          </div>
          <ChatContainer selectedPromptId={selectedPromptId} />
        </div>

        {/* Side panel */}
        {showLocationPanel && (
          <div className="w-full md:w-96 lg:w-1/3 bg-gray-50 p-4 overflow-y-auto border-l border-gray-200">
            {/* Map View */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Current Location</h2>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setMapMode('simple')}
                    className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg ${
                      mapMode === 'simple' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Simple
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode('interactive')}
                    className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg ${
                      mapMode === 'interactive' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Interactive
                  </button>
                </div>
              </div>
              
              {mapMode === 'interactive' ? (
                <div className="aspect-video w-full mb-2 border border-gray-300 rounded overflow-hidden" style={{ minHeight: '300px' }}>
                  <InteractiveMap 
                    onRouteGenerated={handleRouteGenerated}
                  />
                </div>
              ) : currentLocation ? (
                <div className="aspect-video w-full mb-2 border border-gray-300 rounded overflow-hidden">
                  <iframe
                    ref={mapRef}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps/embed/v1/place?key=${getGoogleMapsApiKey()}&q=${currentLocation.lat},${currentLocation.lng}&zoom=15`}
                    title="Google Maps"
                  ></iframe>
                </div>
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-gray-100 border border-gray-300 rounded">
                  <p className="text-gray-500">No location data available</p>
                </div>
              )}
              
              {currentLocation && (
                <div className="text-sm mb-4">
                  <p><span className="font-medium">Location:</span> {getLocationName()}</p>
                  <p><span className="font-medium">Coordinates:</span> {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</p>
                  {isSimulating && (
                    <p><span className="font-medium">Simulation Progress:</span> {(simulationProgress * 100).toFixed(0)}%</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Simulation Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <h2 className="text-lg font-semibold mb-3">Location Simulation</h2>
              
              {isSimulating ? (
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-green-600 mb-2">
                      ✓ Simulation Active: {selectedRoute}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${simulationProgress * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <button
                    onClick={handleStopSimulation}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Stop Simulation
                  </button>
                </div>
              ) : (
                <div>
                  {mapMode === 'interactive' ? (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 mb-2">
                        {customRoutePoints.length > 0 
                          ? `Custom route with ${customRoutePoints.length} points ready` 
                          : 'Use the interactive map to create a custom route'}
                      </p>
                      {customRoutePoints.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded p-2 text-sm text-green-700">
                          <p>Route generated from {customRoutePoints[0].name || 'Start'} to {
                            customRoutePoints[customRoutePoints.length - 1].name || 'Destination'
                          }</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Route
                      </label>
                      <select
                        value={selectedRoute}
                        onChange={(e) => setSelectedRoute(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Object.keys(PREDEFINED_ROUTES).map((route) => (
                          <option key={route} value={route}>
                            {route}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination Name (optional)
                    </label>
                    <input
                      type="text"
                      value={destinationName}
                      onChange={(e) => setDestinationName(e.target.value)}
                      placeholder="Enter destination name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Simulation Speed
                    </label>
                    <input
                      type="number"
                      value={speedInput}
                      onChange={handleSpeedChange}
                      step="0.01"
                      min="0.01"
                      max="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 0.05 (slower) to 0.5 (faster)
                    </p>
                  </div>

                  <button
                    onClick={handleStartSimulation}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={mapMode === 'interactive' && customRoutePoints.length < 2}
                  >
                    {mapMode === 'interactive' && customRoutePoints.length < 2 
                      ? 'Create a route first' 
                      : 'Start Simulation'}
                  </button>
                </div>
              )}
            </div>
            
            <RecommendationDisplay />
          </div>
        )}
      </main>

      {!apiKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">API Key Required</h2>
            <p className="mb-4">
              You need to set your OpenAI API key to use the chat functionality.
              Add it to your <code>.env</code> file as <code>VITE_OPENAI_API_KEY</code>.
            </p>
            <Link
              to="/"
              className="block w-full text-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Go to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
