// tasks/geofenceTask.js

export const GEOFENCE_TASK_NAME = 'GEOFENCE_TASK';

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { db, auth } from '../config/firebaseConfig';
import EventService from '../services/EventService';
import { getTriggerById } from '../services/geofenceService';

/**
 * Background geofence task that triggers when user enters a registered region.
 * Fetches relevant event data and schedules a notification.
 */
TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Geofence task error:', error);
    return;
  }
  
  // Only process region entry events
  if (data.eventType !== Location.GeofencingEventType.Enter) {
    return;
  }

  const { identifier } = data.region;
  
  // Retrieve the stored trigger data from AsyncStorage
  const trigger = await getTriggerById(identifier);
  if (!trigger || !trigger.active) {
    return;
  }

  try {
    // Fetch complete event details from Firestore
    const event = await EventService.fetchEventById(trigger.eventId);
    if (!event) {
      console.warn('Event not found:', trigger.eventId);
      return;
    }

    // Schedule notification to alert user
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${event.title}`,
        body: event.description || 'You\'ve entered an event zone',
        data: { eventId: event.id },
      },
      trigger: { seconds: 1 },
    });
  } catch (error) {
    console.error('Error in geofence notification:', error);
  }
});
