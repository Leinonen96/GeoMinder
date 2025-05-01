// hooks/useGeofencing.js

import { useEffect } from 'react'
import * as Location from 'expo-location'
import { useEvents } from './UseEvents'
import {
  saveTriggers,
  registerAllGeofences,
  unregisterAllGeofences,
} from '../services/geofenceService'
import { makeIdentifier } from '../utils/geofenceHelpers'

export default function useGeofencing() {
  const { events, loading } = useEvents()

  useEffect(() => {
    if (loading) return

    const now = Date.now()

    // Builds only currently‐active triggers
    const allTriggers = events.flatMap(event =>
      (event.triggers || [])
        .map((trigger, idx) => ({ event, trigger, idx }))
        
        .filter(({ trigger }) => trigger.location != null) // check if location is set
        
        .filter(({ event }) => { // Check if event is active
          const startMs = event.startTime.toDate().getTime()
          const endMs   = event.endTime.toDate().getTime()
          return now >= startMs && now <= endMs
        })
        .map(({ event, trigger, idx }) => ({
          identifier: makeIdentifier(event.id, idx),
          eventId:    event.id,
          latitude:   trigger.location.latitude,
          longitude:  trigger.location.longitude,
          radius:     trigger.radius,
          sound:      trigger.sound,
          vibrate:    trigger.vibrate,
          active:     true,
        }))
    )

    ;(async () => {
      await saveTriggers(allTriggers)
      await unregisterAllGeofences()
      await registerAllGeofences()
    })()
  }, [events, loading])
}
