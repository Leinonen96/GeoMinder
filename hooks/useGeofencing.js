import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useEvents } from './UseEvents';
import { saveTriggers } from '../services/geofenceService';
import { GEOFENCE_TASK_NAME } from '../tasks/geofenceTask';
import { makeIdentifier } from '../utils/geofenceHelpers';

/**
 * Hook that manages geofence registration based on active events
 * Automatically registers/unregisters geofences as events change
 */
export default function useGeofencing() {
  const { events, loading } = useEvents();

  // Register geofences whenever events change
  useEffect(() => {
    if (loading) {
      console.log('⚙️ [useGeofencing] waiting for events to load before registering geofences.');
      return;
    }

    console.log(`⚙️ [useGeofencing] Events loaded (${events.length}), processing for geofences.`);
    const now = Date.now();

    // Extract active triggers from events that should be registered as geofences
    const activeTriggersToRegister = events.flatMap(event =>
      (event.triggers || [])
        .map((t, idx) => ({ event, trigger: t, idx }))
        // Only include triggers with location data
        .filter(({ trigger }) => trigger.location != null)
        // Only include triggers for currently active events
        .filter(({ event }) => {
          if (!event.startTime?.toDate || !event.endTime?.toDate) {
              console.warn(`⚙️ [useGeofencing] Skipping event ${event.id} due to invalid start/end time.`);
              return false;
          }
          const start = event.startTime.toDate().getTime();
          const end = event.endTime.toDate().getTime();
          return now >= start && now <= end;
        })
        .map(({ event, trigger, idx }) => ({
          identifier: makeIdentifier(event.id, idx),
          eventId: event.id,
          latitude: trigger.location.latitude,
          longitude: trigger.location.longitude,
          radius: trigger.radius,
          sound: trigger.sound,
          vibrate: trigger.vibrate,
          active: true,
        }))
    );

    // Register geofences
    (async () => {
      console.log('⚙️ [useGeofencing] Registering', activeTriggersToRegister.length, 'active triggers.');

      // Save triggers to storage for background task access
      try {
          await saveTriggers(activeTriggersToRegister);
      } catch (e) {
          console.error('⚙️ [useGeofencing] Error saving triggers:', e);
      }

      // Stop existing geofences before adding new ones
      try {
        await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
      } catch (e) {
        // Expected error if no geofences were previously registered
        console.warn('⚙️ [useGeofencing] stopGeofencingAsync:', e);
      }

      // Skip if no active triggers to register
      if (activeTriggersToRegister.length === 0) {
           console.log('⚙️ [useGeofencing] No active triggers to register.');
           return;
      }

      // Format triggers for Expo Location API
      const regionsToRegister = activeTriggersToRegister.map(t => ({
          identifier: t.identifier,
          latitude: t.latitude,
          longitude: t.longitude,
          radius: t.radius,
          notifyOnEnter: true,
          notifyOnExit: false,
      }));

      try {
        await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, regionsToRegister);
        console.log('⚙️ [useGeofencing] Geofencing started successfully.');
      } catch (e) {
        console.error('⚙️ [useGeofencing] startGeofencingAsync error:', e);
      }
    })();

  }, [events, loading]);
}