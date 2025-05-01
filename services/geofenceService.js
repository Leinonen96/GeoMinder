// services/geofenceService.js
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location   from 'expo-location'

const STORAGE_KEY = '@myApp:triggers'
const TASK_NAME   = 'GEOFENCE_TASK'

export async function getStoredTriggers() {
  const json = await AsyncStorage.getItem(STORAGE_KEY)
  return json ? JSON.parse(json) : []
}

export async function saveTriggers(triggers) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(triggers))
}

export async function getTriggerById(id) {
  const triggers = await getStoredTriggers()
  return triggers.find(t => t.identifier === id)
}

export async function registerAllGeofences() {
  const triggers = await getStoredTriggers()
  if (!triggers.length) return
  await Location.startGeofencingAsync(
    TASK_NAME,
    triggers.map(t => ({
      identifier:    t.identifier,
      latitude:      t.latitude,
      longitude:     t.longitude,
      radius:        t.radius,
      notifyOnEnter: true,
      notifyOnExit:  false,
    }))
  )
}

export async function unregisterAllGeofences() {
  await Location.stopGeofencingAsync(TASK_NAME)
}
