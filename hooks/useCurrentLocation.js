import { useState, useEffect } from 'react';
import locationService from '../services/locationService';

/**
 * Hook for accessing the device's current location
 * @returns {Object} Location data, error state, and request function
 */
export function useCurrentLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const requestPermission = async () => {
    setLoading(true);
    const granted = await locationService.requestPermission();
    if (granted) {
      try {
        const result = await locationService.getCurrentPosition();
        setLocation(result.location);
        setError(result.error);
      } catch (err) {
        setError('Failed to get location');
      }
    } else {
      setError('Location permission denied');
    }
    setLoading(false);
    return granted;
  };

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
