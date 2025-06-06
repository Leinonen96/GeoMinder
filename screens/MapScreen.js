// screens/MapScreen.js

import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, Dimensions, View, Text, Modal, TouchableWithoutFeedback } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'
import { ActivityIndicator, useTheme } from 'react-native-paper'
import { useFocusEffect } from '@react-navigation/native'
import { useEvents } from '../hooks/UseEvents'
import AddEventButton from '../components/AddEventButton'
import RecenterButton from '../components/RecenterButton'
import EventCard from '../components/EventCard'

export default function MapScreen({ navigation }) {
  const { colors } = useTheme()
  const mapRef = useRef(null)
  const [region, setRegion] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const { events, loading, error, reload } = useEvents()

  // reload on focus
  useFocusEffect(
    React.useCallback(() => {
      reload()
    }, [reload])
  )

  // get user location once
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') throw new Error('Location permission denied')
        const loc = await Location.getCurrentPositionAsync({})
        if (!mounted) return
        const { latitude, longitude } = loc.coords
        setRegion({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 })
      } catch (e) {
        if (mounted) setErrorMsg(e.message)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (errorMsg || error) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{errorMsg || 'Failed to load events'}</Text>
      </View>
    )
  }

  if (!region || loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator animating color={colors.primary} />
        <Text style={{ color: colors.text }}>
          {loading ? 'Loading events...' : 'Initializing map...'}
        </Text>
      </View>
    )
  }

  const recenterMap = () => {
    if (mapRef.current && region) {
      mapRef.current.animateToRegion(region, 1000)
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE} // Use Google Maps on Android
        style={styles.map}
        region={region}
        showsUserLocation
        customMapStyle={colors.mapStyle || []}
      >
        {events.map((evt) => (
          <Marker
            key={evt.id}
            coordinate={{
              latitude: evt.location.latitude,
              longitude: evt.location.longitude,
            }}
            onPress={() => setSelectedEvent(evt)}
            tracksViewChanges={false}
          />
        ))}
      </MapView>

      <Modal
        visible={!!selectedEvent}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalRoot}>
          <TouchableWithoutFeedback onPress={() => setSelectedEvent(null)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            {selectedEvent && (
              <EventCard
                event={selectedEvent}
                onPress={() => setSelectedEvent(null)}
                onViewDetails={(id) => {
                  setSelectedEvent(null)
                  navigation.navigate('EditEvent', { eventId: id })
                }}
              />
            )}
          </View>
        </View>
      </Modal>


      <AddEventButton onPress={() => navigation.navigate('AddEvent')} />
      <RecenterButton onPress={recenterMap} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalRoot: { flex: 1 },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
})
