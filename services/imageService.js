import * as ImagePicker from 'expo-image-picker';

/**
 * Service to handle image picking operations
 */
const imageService = {
  /**
   * Request media library permissions
   * @returns {Promise<boolean>} True if permission granted
   */
  requestPermission: async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return false;
    }
  },

  /**
   * Launch the image picker to select an image
   * @param {Object} options Configuration options for the picker
   * @returns {Promise<Object>} Object with uri if successful, error if failed
   */
  pickImage: async (options = {}) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        ...options
      });
      
      if (!result.canceled && result.assets?.length > 0) {
        return { uri: result.assets[0].uri, error: null };
      }
      
      return { uri: null, error: null }; // User canceled, no error
    } catch (error) {
      console.error('Error picking image:', error);
      return { uri: null, error: 'Failed to pick image' };
    }
  }
};

export default imageService;
