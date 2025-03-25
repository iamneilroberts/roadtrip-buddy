import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LocationDisplay from '../components/Map/LocationDisplay';
import { hasOpenAIApiKey } from '../utils/env';

const HomePage: React.FC = () => {
  const [apiKeyAvailable, setApiKeyAvailable] = useState<boolean>(false);

  // Check if API key is available from environment variables
  useEffect(() => {
    // Debug code to verify environment variables
    console.log('OpenAI API Key from env available:', !!import.meta.env.VITE_OPENAI_API_KEY);
    
    setApiKeyAvailable(hasOpenAIApiKey());
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Roadtrip Buddy</h1>
          <p className="mt-2">Your personalized road trip assistant</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <LocationDisplay />

            {!apiKeyAvailable && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      OpenAI API key not found. Please add it to your <code>.env</code> file as <code>VITE_OPENAI_API_KEY</code>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white shadow-md rounded-lg p-6 mb-4">
              <h2 className="text-2xl font-bold mb-4">How to Use Roadtrip Buddy</h2>
              
              <div className="space-y-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                    <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                    Start a Route Simulation
                  </h3>
                  <p className="mt-2 text-blue-700 pl-8">
                    Begin by simulating a drive along a predefined route. This will provide location context for your chat recommendations.
                  </p>
                  <Link
                    to="/simulation"
                    className="mt-3 ml-8 inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Start Route Simulation
                  </Link>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-lg font-semibold text-green-800 flex items-center">
                    <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                    Get AI-Powered Recommendations
                  </h3>
                  <p className="mt-2 text-green-700 pl-8">
                    Once your simulation is running, chat with our AI to get location-aware recommendations for restaurants, attractions, and services.
                  </p>
                  <Link
                    to="/chat"
                    className="mt-3 ml-8 inline-block px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    Open Chat Assistant
                  </Link>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-800">Pro Tips:</h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                  <li>Use a simulation speed of 0.01-0.05 for a more realistic driving experience</li>
                  <li>The simulation will continue running while you chat</li>
                  <li>Try asking about restaurants, gas stations, or attractions "nearby"</li>
                  <li>Your simulated location will be used for all recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <p className="text-center"> 2025 Roadtrip Buddy - A Progressive Web App for road trip recommendations</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
