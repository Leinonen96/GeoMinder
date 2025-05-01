// tasks/geofenceTask.js

// Shared constant for task registration
export const GEOFENCE_TASK_NAME = 'GEOFENCE_TASK'

import * as TaskManager     from 'expo-task-manager'
import * as Location        from 'expo-location'
import * as Notifications   from 'expo-notifications'

import { getTriggerById }   from '../services/geofenceService'
import EventService         from '../services/EventService'

/**
 * Background geofence TaskManager task.
 * Fires whenever you enter a registered region.
 */
TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }) => {
  console.log('🛰️ [GEOFENCE_TASK] fired:', data, error)

  // Bail on errors or non-enter events
  if (error) {
    console.error('🛰️ Geofence task error:', error)
    return
  }
  if (data.eventType !== Location.GeofencingEventType.Enter) {
    console.log('🛰️ Ignoring non-enter eventType:', data.eventType)
    return
  }

  const { identifier } = data.region

  // Look up the persisted trigger
  const trigger = await getTriggerById(identifier)
  console.log('🛰️ Found trigger:', trigger)
  if (!trigger || !trigger.active) {
    console.log('🛰️ No active trigger, skipping.')
    return
  }

  // Fetch full event details from Firestore
  let event
  try {
    event = await EventService.fetchEventById(trigger.eventId)
  } catch (e) {
    console.warn('🛰️ Event not found for ID', trigger.eventId)
    return
  }
  console.log('🛰️ Event details:', event)

  // Build a unique notification payload
  const payload = {
    title:   `🔔 ${event.title}`,
    body:    event.description || 'You’ve entered an event zone',
    data:    { eventId: event.id },
    sound:   trigger.sound ? 'default' : undefined,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }

  // Immediately present the notification (won’t collapse duplicates)
  try {
    await Notifications.presentNotificationAsync(payload)
    console.log('🛰️ Presented notification for event:', event.id)
  } catch (notifErr) {
    console.error('🛰️ Failed to present notification:', notifErr)
  }
})
