import React, { useState, useEffect, useRef } from 'react';
import { getGoogleMapsApiKey } from '../../utils/env';
import { Location } from '../../api/geolocation';
import { useLocation } from '../../hooks/useLocation';

interface InteractiveMapProps {
  onRouteGenerated?: (points: Location[]) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ onRouteGenerated }) => {
  const { currentLocation } = useLocation();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routePoints, setRoutePoints] = useState<Location[]>([]);
  
  // Use refs for values that shouldn't trigger re-renders
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  
  // Track pin state with refs to avoid re-render issues
  const startPointRef = useRef<google.maps.LatLng | null>(null);
  const endPointRef = useRef<google.maps.LatLng | null>(null);
  const pinStateRef = useRef<'waitingForStart' | 'waitingForEnd' | 'routeCreated'>('waitingForStart');
  
  // Status for UI feedback
  const [statusMessage, setStatusMessage] = useState<string>('Click on the map to set your starting point');

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsApi = async () => {
      const apiKey = getGoogleMapsApiKey();
      if (!apiKey) {
        console.error('Google Maps API key is missing');
        return;
      }

      // Check if the API is already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Load the Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = initializeMap;
      document.head.appendChild(script);
      
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    };

    loadGoogleMapsApi();
  }, []);

  // Initialize the map
  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Default center (will be updated if currentLocation is available)
    const center = currentLocation 
      ? { lat: currentLocation.lat, lng: currentLocation.lng } 
      : { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco

    const mapOptions: google.maps.MapOptions = {
      center,
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    };

    const map = new google.maps.Map(mapRef.current, mapOptions);
    googleMapRef.current = map;

    // Initialize directions service and renderer
    directionsServiceRef.current = new google.maps.DirectionsService();
    directionsRendererRef.current = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true, // We'll create our own markers
    });

    // Add click listener to the map
    map.addListener('click', handleMapClick);

    setMapLoaded(true);
    console.log('Map initialized successfully');
    
    // Reset state
    pinStateRef.current = 'waitingForStart';
    startPointRef.current = null;
    endPointRef.current = null;
    setStatusMessage('Click on the map to set your starting point');
  };

  // Handle map click events
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng || !googleMapRef.current) return;
    
    const clickPosition = event.latLng;
    console.log(`Map clicked at ${clickPosition.lat()}, ${clickPosition.lng()}, current state: ${pinStateRef.current}`);
    
    if (pinStateRef.current === 'waitingForStart') {
      // Clear previous markers and route
      clearMarkersAndRoute();
      
      // Set start point
      startPointRef.current = clickPosition;
      endPointRef.current = null;
      
      // Add marker
      addMarker(clickPosition, 'A');
      
      // Update state
      pinStateRef.current = 'waitingForEnd';
      setStatusMessage('Now click to set your destination point');
      console.log('Start point set, waiting for end point');
    }
    else if (pinStateRef.current === 'waitingForEnd') {
      // Set end point
      endPointRef.current = clickPosition;
      
      // Add marker
      addMarker(clickPosition, 'B');
      
      // Update state
      pinStateRef.current = 'routeCreated';
      setStatusMessage('Route created! Click "Use This Route" or reset the map');
      
      // Calculate route
      if (startPointRef.current) {
        console.log('End point set, calculating route');
        calculateRoute(startPointRef.current, clickPosition);
      }
    }
    else if (pinStateRef.current === 'routeCreated') {
      // Reset and start over
      clearMarkersAndRoute();
      
      // Set new start point
      startPointRef.current = clickPosition;
      endPointRef.current = null;
      
      // Add marker
      addMarker(clickPosition, 'A');
      
      // Update state
      pinStateRef.current = 'waitingForEnd';
      setStatusMessage('Now click to set your destination point');
      console.log('Reset and set new start point');
    }
  };

  // Update map center when current location changes
  useEffect(() => {
    if (mapLoaded && googleMapRef.current && currentLocation) {
      const center = new google.maps.LatLng(currentLocation.lat, currentLocation.lng);
      googleMapRef.current.setCenter(center);
      
      // If no points are set yet, set the current location as the start point
      if (pinStateRef.current === 'waitingForStart') {
        startPointRef.current = center;
        addMarker(center, 'A');
        pinStateRef.current = 'waitingForEnd';
        setStatusMessage('Now click to set your destination point');
      }
    }
  }, [currentLocation, mapLoaded]);

  // Add a marker to the map
  const addMarker = (position: google.maps.LatLng, label: string) => {
    if (!googleMapRef.current) return;

    console.log(`Adding marker: ${label} at ${position.lat()}, ${position.lng()}`);
    
    const marker = new google.maps.Marker({
      position,
      map: googleMapRef.current,
      title: label === 'A' ? 'Start' : 'Destination',
      animation: google.maps.Animation.DROP,
      label: label,
    });

    markersRef.current.push(marker);
  };

  // Clear all markers and route
  const clearMarkersAndRoute = () => {
    // Clear markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Clear route
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] });
    }

    setRoutePoints([]);
  };

  // Calculate route between two points
  const calculateRoute = (start: google.maps.LatLng, end: google.maps.LatLng) => {
    if (!directionsServiceRef.current || !directionsRendererRef.current) {
      console.error('Directions service or renderer not initialized');
      return;
    }

    console.log(`Calculating route from ${start.lat()}, ${start.lng()} to ${end.lat()}, ${end.lng()}`);

    const request: google.maps.DirectionsRequest = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsServiceRef.current.route(request, (result, status) => {
      console.log('Route calculation result:', status);
      
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRendererRef.current!.setDirections(result);
        
        // Extract route points
        const points: Location[] = [];
        const route = result.routes[0];
        
        if (route && route.legs.length > 0) {
          const leg = route.legs[0];
          
          // Add start point
          points.push({
            lat: leg.start_location.lat(),
            lng: leg.start_location.lng(),
            timestamp: Date.now(),
            name: leg.start_address,
          });
          
          // Add points along the route
          route.legs[0].steps.forEach(step => {
            // Add points from the step path
            step.path.forEach((path, index) => {
              // Only add some points to avoid too many
              if (index % 3 === 0) {
                points.push({
                  lat: path.lat(),
                  lng: path.lng(),
                  timestamp: Date.now() + index * 1000,
                });
              }
            });
          });
          
          // Add end point
          points.push({
            lat: leg.end_location.lat(),
            lng: leg.end_location.lng(),
            timestamp: Date.now() + points.length * 1000,
            name: leg.end_address,
          });
          
          setRoutePoints(points);
          console.log(`Route generated with ${points.length} points`);
          
          // Notify parent component about the generated route
          if (onRouteGenerated) {
            onRouteGenerated(points);
          }
        }
      } else {
        console.error('Directions request failed:', status);
      }
    });
  };

  // Handle the "Use This Route" button click
  const handleUseRoute = () => {
    if (routePoints.length > 0 && onRouteGenerated) {
      onRouteGenerated(routePoints);
    }
  };

  // Reset the map
  const handleReset = () => {
    clearMarkersAndRoute();
    startPointRef.current = null;
    endPointRef.current = null;
    pinStateRef.current = 'waitingForStart';
    setStatusMessage('Click on the map to set your starting point');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow relative" style={{ minHeight: '400px' }}>
        <div 
          ref={mapRef} 
          className="w-full h-full rounded-lg border border-gray-300"
        ></div>
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
            <p>Loading map...</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Reset Map
        </button>
        
        <button
          onClick={handleUseRoute}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={routePoints.length === 0}
        >
          Use This Route
        </button>
      </div>
      
      <div className="mt-3 text-sm text-gray-600">
        <p>{statusMessage}</p>
        {routePoints.length > 0 && (
          <p className="text-green-600 mt-1">Route generated with {routePoints.length} points.</p>
        )}
      </div>
    </div>
  );
};

export default InteractiveMap;
