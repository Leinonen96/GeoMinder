// tasks/geofenceTask.js
import * as TaskManager from 'expo-task-manager'
import * as Location    from 'expo-location'
import { getTriggerById }   from '../services/geofenceService'
import { sendNotification } from '../services/notificationService'

const GEOFENCE_TASK = 'GEOFENCE_TASK'

TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Geofence task error:', error)
    return
  }

  const { eventType, region } = data
  if (eventType === Location.GeofencingEventType.Enter) {
    const trigger = await getTriggerById(region.identifier)
    if (!trigger || !trigger.active) return

    // trigger.sound & trigger.vibrate available here
    const event = await trigger.eventProvider(trigger.eventId)
    sendNotification(event, { sound: trigger.sound, vibrate: trigger.vibrate })
  }
})
