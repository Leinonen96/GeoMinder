import { useState, useEffect, useCallback } from 'react';

export default function useTriggers(navigation, route) {
  const [triggers, setTriggers] = useState([]);
  
  // Handle trigger-location selection via params
  useEffect(() => {
    const { triggerIndex, selectedLocation, selectedRadius } = route.params || {};

    // Check if params are set and valid
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

      // reset params
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

  // Add a new trigger with default values
  const addTrigger = useCallback(() => {
    setTriggers((ts) => [
      ...ts,
      { vibrate: true, sound: true, location: null, radius: 100 },
    ]);
  }, []);
  
    // Toggle trigger properties (vibrate, sound)
  const toggleTrigger = useCallback((index, key) => {
    setTriggers((ts) => {
      const copy = [...ts];
      copy[index][key] = !copy[index][key];
      return copy;
    });
  }, []);
  
    // Remove a trigger by index
  const removeTrigger = useCallback((index) => {
    setTriggers((ts) => ts.filter((_, i) => i !== index));
  }, []);

  const updateTriggerLocation = useCallback((index, location, radius) => {
    setTriggers((ts) => {
      const copy = [...ts];
      copy[index] = { ...copy[index], location, radius };
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