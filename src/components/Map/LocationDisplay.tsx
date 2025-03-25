import React, { useState, useEffect } from 'react';
import { useLocation } from '../../hooks/useLocation';
import { getGoogleMapsApiKey } from '../../utils/env';
import { Location } from '../../api/geolocation';
import LoadingSpinner from '../LoadingSpinner';

const LocationDisplay: React.FC = () => {
  const { 
    currentLocation, 
    isLoading, 
    error, 
    isWatching,
    startWatching,
    stopWatching,
    isSimulating,
    startSimulation,
    stopSimulation
  } = useLocation();

  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationPoints, setSimulationPoints] = useState<string>('');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);

  // Debug code to verify environment variables
  useEffect(() => {
    console.log('Google Maps API Key available:', !!getGoogleMapsApiKey());
    console.log('Google Maps API Key:', getGoogleMapsApiKey().substring(0, 5) + '...');
    console.log('OpenAI API Key available:', !!import.meta.env.VITE_OPENAI_API_KEY);
  }, []);

  const handleStartWatching = () => {
    startWatching();
  };

  const handleStopWatching = () => {
    stopWatching();
  };

  const handleStartSimulation = () => {
    try {
      // Parse the simulation points
      const points: Location[] = simulationPoints
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [lat, lng] = line.split(',').map(coord => parseFloat(coord.trim()));
          if (isNaN(lat) || isNaN(lng)) {
            throw new Error(`Invalid coordinates: ${line}`);
          }
          return { lat, lng, timestamp: Date.now() };
        });

      if (points.length < 2) {
        alert('Please enter at least 2 points for simulation');
        return;
      }

      // Ensure speed is a valid number
      const speed = parseFloat(simulationSpeed.toString());
      if (isNaN(speed) || speed <= 0) {
        alert('Please enter a valid simulation speed greater than 0');
        return;
      }

      startSimulation(points, speed);
    } catch (error) {
      alert(`Error parsing simulation points: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleStopSimulation = () => {
    stopSimulation();
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const speed = parseFloat(value);
    if (!isNaN(speed) && speed > 0) {
      setSimulationSpeed(speed);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">Location</h2>
      
      {isLoading ? (
        <div className="flex justify-center my-4">
          <LoadingSpinner size="medium" color="gray" />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-2" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error.message}</span>
        </div>
      ) : currentLocation ? (
        <div>
          <p className="mb-1">
            <span className="font-medium">Latitude:</span> {currentLocation.lat.toFixed(6)}
          </p>
          <p className="mb-1">
            <span className="font-medium">Longitude:</span> {currentLocation.lng.toFixed(6)}
          </p>
          {currentLocation.accuracy && (
            <p className="mb-1">
              <span className="font-medium">Accuracy:</span> {currentLocation.accuracy.toFixed(2)} meters
            </p>
          )}
          <p className="mb-2">
            <a 
              href={`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View on Google Maps
            </a>
          </p>
          <p className="text-sm text-gray-500">
            {isSimulating ? 'Simulating location' : isWatching ? 'Watching location' : 'Location snapshot'}
          </p>
        </div>
      ) : (
        <p className="text-gray-500">No location data available</p>
      )}
      
      <div className="mt-4 flex flex-wrap gap-2">
        {!isWatching && !isSimulating ? (
          <button
            onClick={handleStartWatching}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Start Tracking
          </button>
        ) : isWatching ? (
          <button
            onClick={handleStopWatching}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Stop Tracking
          </button>
        ) : null}
        
        <button
          onClick={() => setShowSimulation(!showSimulation)}
          className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {showSimulation ? 'Hide Simulation' : 'Show Simulation'}
        </button>
      </div>
      
      {showSimulation && (
        <div className="mt-4 p-3 border border-gray-200 rounded-md">
          <h3 className="text-lg font-medium mb-2">Location Simulation</h3>
          
          {isSimulating ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">Currently simulating location movement</p>
              <button
                onClick={handleStopSimulation}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Stop Simulation
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Simulation Points (lat,lng per line)
                </label>
                <textarea
                  value={simulationPoints}
                  onChange={(e) => setSimulationPoints(e.target.value)}
                  placeholder="40.7128,-74.0060&#10;40.7129,-74.0061&#10;40.7130,-74.0062"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={5}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter one coordinate pair per line in the format "latitude,longitude"
                </p>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Simulation Speed (points per second)
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={simulationSpeed}
                  onChange={handleSpeedChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use decimal values (e.g., 0.2) for slower simulation
                </p>
              </div>
              
              <button
                onClick={handleStartSimulation}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Start Simulation
              </button>
            </div>
          )}
          
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Sample Routes:</h4>
            <button
              onClick={() => setSimulationPoints("40.7128,-74.0060\n40.7129,-74.0061\n40.7130,-74.0062\n40.7131,-74.0063\n40.7132,-74.0064")}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 mr-2"
            >
              NYC Sample
            </button>
            <button
              onClick={() => setSimulationPoints("37.7749,-122.4194\n37.7750,-122.4195\n37.7751,-122.4196\n37.7752,-122.4197\n37.7753,-122.4198")}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
            >
              SF Sample
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDisplay;
