import * as Location from 'expo-location';

/**
 * Service to handle location-related operations
 */
const locationService = {
  /**
   * Request location permissions
   * @returns {Promise<boolean>} True if permission granted
   */
  requestPermission: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  },

  /**
   * Get current device position
   * @returns {Promise<{location: object|null, error: string|null}>} Location and error state
   */
  getCurrentPosition: async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      return { 
        location: location.coords, 
        error: null 
      };
    } catch (error) {
      console.error('Error getting current position:', error);
      return { 
        location: null, 
        error: 'Failed to get current location' 
      };
    }
  }
};

export default locationService;
