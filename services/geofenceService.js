// src/services/geofenceService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GEOFENCE_TASK_NAME } from '../tasks/geofenceTask';

const STORAGE_KEY = '@GeoMinder:triggers';
const TASK_NAME = GEOFENCE_TASK_NAME;

/**
 * Retrieves the stored geofence triggers from AsyncStorage.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of stored trigger objects. Returns an empty array if none are stored.
 */
export async function getStoredTriggers() {
  console.log("geofenceService: Attempting to get stored triggers from AsyncStorage...");
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const triggers = json ? JSON.parse(json) : [];
    console.log(`geofenceService: Retrieved ${triggers.length} triggers from storage.`);
    // Add logging to show the identifiers of stored triggers
    if (triggers.length > 0) {
        console.log("geofenceService: Stored trigger identifiers:", triggers.map(t => t.identifier));
    }
    return triggers;
  } catch (error) {
    console.error("geofenceService: Error getting stored triggers:", error);
    return [];
  }
}

/**
 * Saves the provided array of triggers to AsyncStorage.
 * Overwrites any previously stored triggers under the same key.
 * @param {Array<Object>} triggers An array of trigger objects to save.
 * @returns {Promise<void>} A promise that resolves when the triggers are successfully saved.
 */
export async function saveTriggers(triggers) {
  console.log(`geofenceService: Attempting to save ${triggers.length} triggers to AsyncStorage...`);
  // Add logging to show the identifiers being saved
  if (triggers.length > 0) {
      console.log("geofenceService: Saving trigger identifiers:", triggers.map(t => t.identifier));
  }
  try {
    const json = JSON.stringify(triggers);
    await AsyncStorage.setItem(STORAGE_KEY, json);
    console.log("geofenceService: Triggers successfully saved to storage.");
  } catch (error) {
    console.error("geofenceService: Error saving triggers:", error);
  }
}

/**
 * Retrieves a single stored trigger by its identifier from AsyncStorage.
 * Used by the background geofence task.
 * @param {string} id The unique identifier of the trigger to retrieve.
 * @returns {Promise<Object | undefined>} A promise that resolves with the trigger object if found, otherwise undefined.
 */
export async function getTriggerById(id) {
  console.log(`geofenceService: Attempting to get trigger by ID "${id}" from storage...`);
  const triggers = await getStoredTriggers(); // This will now log stored identifiers
  const trigger = triggers.find(t => t.identifier === id);
  console.log(`geofenceService: Trigger by ID "${id}" ${trigger ? 'found' : 'not found'} in storage.`);
  return trigger;
}
