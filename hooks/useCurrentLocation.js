import { useState, useEffect } from 'react';
import locationService from '../services/locationService';

/**
 * Custom hook to retrieve the device's current location.
 * Manages location data, error messages, loading state, and a function to request permissions.
 * @returns {Object} Contains location data, error state, loading state, and a request function.
 */
export function useCurrentLocation() {
  const [location, setLocation] = useState(null); // Current location data
  const [error, setError] = useState(null); // Error messages
  const [loading, setLoading] = useState(true); // Loading state

  /**
   * Requests location permissions and retrieves the current location if granted.
   * Updates location, error, and loading states.
   * @returns {boolean} True if permissions are granted, otherwise false.
   */
  const requestPermission = async () => {
    setLoading(true);
    const granted = await locationService.requestPermission();
    if (granted) {
      try {
        const result = await locationService.getCurrentPosition();
        setLocation(result.location);
        setError(result.error);
      } catch {
        setError('Failed to get location');
      }
    } else {
      setError('Location permission denied');
    }
    setLoading(false);
    return granted;
  };

  // Automatically request location permissions on initialization
  useEffect(() => {
    requestPermission();
  }, []);

  return {
    location,
    error,
    loading,
    requestPermission
  };
}