// screens/ListScreen.js

import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  FlatList,
  Modal,
  Text,
  TouchableWithoutFeedback,
} from 'react-native'
import { ActivityIndicator, useTheme } from 'react-native-paper'
import { useFocusEffect } from '@react-navigation/native'
import { useEvents } from '../hooks/UseEvents'
import ListEventCard from '../components/ListEventCard'
import EventCard from '../components/EventCard'

export default function ListScreen() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const { colors } = useTheme()
  const { events, loading, error, reload } = useEvents()

  // reload on focus
  useFocusEffect(
    React.useCallback(() => {
      reload()
    }, [reload])
  )

  const handleEventPress = (event) => setSelectedEvent(event)

  // sort active first then by start time
  const sortedEvents = [...events].sort((a, b) => {
    const now = Date.now()
    const aActive = now >= a.startTime.toMillis() && now <= a.endTime.toMillis()
    const bActive = now >= b.startTime.toMillis() && now <= b.endTime.toMillis()
    if (aActive !== bActive) return aActive ? -1 : 1
    return a.startTime.toMillis() - b.startTime.toMillis()
  })

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error }}>Failed to load events</Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator animating color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Loading events...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {sortedEvents.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={{ color: colors.text }}>No events found</Text>
        </View>
      ) : (
        <FlatList
          data={sortedEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListEventCard event={item} onPress={handleEventPress} />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

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
            {selectedEvent && <EventCard event={selectedEvent} />}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingVertical: 12 },
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
