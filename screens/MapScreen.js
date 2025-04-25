// src/screens/MapScreen.js
import React, { useEffect, useState, useRef } from 'react'
import { StyleSheet, Dimensions, View, Text, Modal, TouchableWithoutFeedback } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import * as Location from 'expo-location'
import { ActivityIndicator, useTheme } from 'react-native-paper'
import AddEventButton from '../components/AddEventButton'
import RecenterButton from '../components/RecenterButton'
import EventCard from '../components/EventCard'
import { useEvents } from '../hooks/UseEvents'

export default function MapScreen({ navigation }) {
  const { colors } = useTheme()
  const mapViewRef = useRef(null)
  const [region, setRegion] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const { events, loading, error } = useEvents()

  // Fetch user's current location once
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
    return () => { mounted = false }
  }, [])

  // Center map back to user
  const recenterMap = () => {
    if (mapViewRef.current && region) {
      mapViewRef.current.animateToRegion(region, 1000)
    }
  }

  // Handle loading or errors
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
        <Text style={{ color: colors.text }}>{loading ? 'Loading events...' : 'Initializing map...'}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        style={styles.map}
        region={region}
        showsUserLocation
        customMapStyle={colors.mapStyle || []}
      >
        {/* Renders each event as a clickable marker */}
        {events.map(event => (
          <Marker
            key={event.id}
            coordinate={{ latitude: event.location.latitude, longitude: event.location.longitude }}
            onPress={() => setSelectedEvent(event)}
            tracksViewChanges={false}
          />
        ))}
      </MapView>

      {/* Modal for showing selected event card */}
      <Modal
  visible={!!selectedEvent}
  transparent
  animationType="fade"
  onRequestClose={() => setSelectedEvent(null)}
>
  <View style={styles.modalRoot}>
    {/* 1) the dark backdrop, full-screen, catches taps to dismiss */}
    <TouchableWithoutFeedback onPress={() => setSelectedEvent(null)}>
      <View style={styles.modalOverlay} />
    </TouchableWithoutFeedback>

    {/* 2) the actual content sits *after* the overlay, so it's on top */}
    <View style={styles.modalContent}>
      {selectedEvent && (
        <EventCard
          event={selectedEvent}
          onPress={() => {}}
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
  container: {
    flex: 1
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Root view for modal to stack overlay and content correctly
  modalRoot: {
    flex: 1
  },
  // Full-screen backdrop behind modal content
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  // Centered modal content container
  modalContent: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8
  }
})
