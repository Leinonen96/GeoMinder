import { useState, useEffect, useCallback } from 'react';

/**
 * Manages trigger state for event geofences
 * Handles adding, editing, and removing triggers while integrating with navigation
 */
export default function useTriggers(navigation, route) {
  const [triggers, setTriggers] = useState([]);

  // Handle trigger updates from navigation params (after selecting location/radius)
  useEffect(() => {
    const { triggerIndex, selectedLocation, selectedRadius } = route.params || {};

    // Process location selection when all params are available
    if (
      typeof triggerIndex === 'number' && 
      selectedLocation && 
      typeof selectedRadius === 'number'
    ) {
      setTriggers((ts) => {
        const copy = [...ts];
        copy[triggerIndex] = {
          ...copy[triggerIndex],
          location: selectedLocation, 
          radius: selectedRadius,
        };
        return copy;
      });

      // Reset params to prevent re-processing on screen focus
      navigation.setParams({
        triggerIndex: undefined,
        selectedLocation: undefined,
        selectedRadius: undefined,
      });
    }
  }, [
    route.params?.triggerIndex,
    route.params?.selectedLocation,
    route.params?.selectedRadius,
    navigation,
  ]);

  /**
   * Adds a new trigger with default values
   */
  const addTrigger = useCallback(() => {
    setTriggers((ts) => [
      ...ts,
      { vibrate: true, sound: true, location: null, radius: 100 },
    ]);
  }, []);

  /**
   * Toggles a boolean property for a trigger
   * @param {number} index Trigger index
   * @param {'vibrate'|'sound'} key Property to toggle
   */
  const toggleTrigger = useCallback((index, key) => {
    setTriggers((ts) => {
      const copy = [...ts];
      if (copy[index] && typeof copy[index][key] === 'boolean') {
         copy[index][key] = !copy[index][key];
      }
      return copy;
    });
  }, []);

  /**
   * Removes a trigger at specified index
   */
  const removeTrigger = useCallback((index) => {
    setTriggers((ts) => ts.filter((_, i) => i !== index));
  }, []);

  /**
   * Updates location and radius for a trigger directly
   * Alternative to navigation params method
   */
  const updateTriggerLocation = useCallback((index, location, radius) => {
    setTriggers((ts) => {
      const copy = [...ts];
      if (copy[index]) {
        copy[index] = { ...copy[index], location, radius };
      }
      return copy;
    });
  }, []);

  return {
    triggers,
    setTriggers,
    addTrigger,
    toggleTrigger,
    removeTrigger,
    updateTriggerLocation,
  };
}