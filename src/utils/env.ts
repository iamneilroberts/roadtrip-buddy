/**
 * Environment variable utilities
 * 
 * This file provides a centralized way to access environment variables
 * with proper typing and fallback values.
 */

/**
 * Get the Google Maps API key from environment variables
 * @returns The Google Maps API key or an empty string if not set
 */
export const getGoogleMapsApiKey = (): string => {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
};

/**
 * Get the OpenAI API key from environment variables or localStorage
 * @returns The OpenAI API key or an empty string if not set
 */
export const getOpenAIApiKey = (): string => {
  // First try localStorage (user-provided key)
  const localStorageKey = localStorage.getItem('openai_api_key');
  if (localStorageKey) {
    return localStorageKey;
  }
  
  // Fall back to environment variable
  return import.meta.env.VITE_OPENAI_API_KEY || '';
};

/**
 * Check if the OpenAI API key is set
 * @returns True if the OpenAI API key is set, false otherwise
 */
export const hasOpenAIApiKey = (): boolean => {
  return getOpenAIApiKey().length > 0;
};

/**
 * Check if the Google Maps API key is set
 * @returns True if the Google Maps API key is set, false otherwise
 */
export const hasGoogleMapsApiKey = (): boolean => {
  return getGoogleMapsApiKey().length > 0;
};
