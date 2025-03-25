/**
 * Types for geolocation data
 */
export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
  name?: string;
}

export interface GeolocationError {
  code: number;
  message: string;
}

/**
 * Gets the current position using the browser's Geolocation API
 * @returns Promise that resolves to the current location
 */
export const getCurrentPosition = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        const geolocationError: GeolocationError = {
          code: error.code,
          message: error.message || getErrorMessage(error.code)
        };
        reject(geolocationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Watches the user's position and calls the callback when it changes
 * @param onPositionChange Callback function to call when position changes
 * @param onError Callback function to call when an error occurs
 * @returns Function to stop watching the position
 */
export const watchPosition = (
  onPositionChange: (location: Location) => void,
  onError?: (error: GeolocationError) => void
): (() => void) => {
  if (!navigator.geolocation) {
    if (onError) {
      onError({
        code: 0,
        message: 'Geolocation is not supported by your browser'
      });
    }
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onPositionChange({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
    },
    (error) => {
      if (onError) {
        onError({
          code: error.code,
          message: error.message || getErrorMessage(error.code)
        });
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
};

/**
 * Gets a human-readable error message for a geolocation error code
 * @param code The error code
 * @returns A human-readable error message
 */
const getErrorMessage = (code: number): string => {
  switch (code) {
    case 1:
      return 'Permission denied. Please allow location access to use this feature.';
    case 2:
      return 'Position unavailable. The network is down or the positioning satellites cannot be contacted.';
    case 3:
      return 'Timeout. The request to get user location timed out.';
    default:
      return 'An unknown error occurred while trying to access your location.';
  }
};
