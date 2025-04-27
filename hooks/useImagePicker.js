import { useState, useCallback } from 'react';
import imageService from '../services/imageService';

/**
 * Hook for picking images from the device's media library
 * @param {Object} options Options for the image picker
 * @returns {Object} Image data, pick function, and error state
 */
export function useImagePicker(options = {}) {
  const [imageUri, setImageUri] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Request permission
    const hasPermission = await imageService.requestPermission();
    if (!hasPermission) {
      setError('Permission to access media library was denied');
      setLoading(false);
      return null;
    }
    
    // Pick image
    const { uri, error: pickError } = await imageService.pickImage(options);
    
    if (pickError) {
      setError(pickError);
    } else if (uri) {
      setImageUri(uri);
    }
    
    setLoading(false);
    return uri;
  }, [options]);

  return {
    imageUri,
    pickImage,
    error,
    loading,
    // Add a setter to allow external uri setting (useful for initial values)
    setImageUri
  };
}
