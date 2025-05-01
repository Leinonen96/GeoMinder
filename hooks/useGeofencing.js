// hooks/useGeofencing.js
import { useEffect } from 'react'
import * as Location from 'expo-location'
import { useEvents } from './UseEvents'   // adjust to your filename casing
import { saveTriggers }     from '../services/geofenceService'
import { GEOFENCE_TASK }     from '../tasks/geofenceTask'
import { makeIdentifier }    from '../utils/geofenceHelpers'

export default function useGeofencing() {
  const { events, loading } = useEvents()

  useEffect(() => {
    if (loading) return

    const now = Date.now()

    const allTriggers = events.flatMap(event =>
      (event.triggers || [])
        .map((t, idx) => ({ event, trigger: t, idx }))
        .filter(({ trigger }) => trigger.location != null)
        .filter(({ event }) => {
          const start = event.startTime.toDate().getTime()
          const end   = event.endTime.toDate().getTime()
          return now >= start && now <= end
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
      console.log('⚙️ [useGeofencing] registering', allTriggers.length, 'triggers')
      await saveTriggers(allTriggers)

      try {
        console.log('⚙️ [useGeofencing] stopping previous geofences')
        await Location.stopGeofencingAsync(GEOFENCE_TASK)
      } catch (e) {
        console.warn('⚙️ stopGeofencingAsync error:', e)
      }

      try {
        console.log('⚙️ [useGeofencing] starting geofencing')
        await Location.startGeofencingAsync(GEOFENCE_TASK, allTriggers)
        console.log('⚙️ Geofencing started')
      } catch (e) {
        console.error('⚙️ startGeofencingAsync error:', e)
      }
    })()
  }, [events, loading])
}