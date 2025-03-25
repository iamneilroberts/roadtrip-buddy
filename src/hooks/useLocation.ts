import { useContext } from 'react';
import LocationContext from '../context/LocationContext';

/**
 * Custom hook to access the location context
 * @returns The location context state and functions
 */
export const useLocation = () => {
  return useContext(LocationContext);
};

export default useLocation;
