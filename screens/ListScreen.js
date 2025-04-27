import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Modal, Text, TouchableWithoutFeedback } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useEvents } from '../hooks/UseEvents';
import ListEventCard from '../components/ListEventCard';
import EventCard from '../components/EventCard';

export default function ListScreen() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { colors } = useTheme();
  const { events, loading, error } = useEvents();

  const handleEventPress = (event) => {
    setSelectedEvent(event);
  };

  // Sort events: active events first, then inactive ones
  const sortedEvents = [...events].sort((a, b) => {
    const now = Date.now();
    const aIsActive = now >= a.startTime.toMillis() && now <= a.endTime.toMillis();
    const bIsActive = now >= b.startTime.toMillis() && now <= b.endTime.toMillis();
    
    // If active status differs, active events come first
    if (aIsActive !== bIsActive) {
      return aIsActive ? -1 : 1;
    }
    
    // If both have same active status, sort by start time
    return a.startTime.toMillis() - b.startTime.toMillis();
  });

  // Handle loading or errors
  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error }}>Failed to load events</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator animating color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Events List */}
      {sortedEvents.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={{ color: colors.text }}>No events found</Text>
        </View>
      ) : (
        <FlatList
          data={sortedEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListEventCard 
              event={item} 
              onPress={handleEventPress} 
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal for showing selected event card */}
      <Modal
        visible={!!selectedEvent}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalRoot}>
          {/* The dark backdrop that catches taps to dismiss */}
          <TouchableWithoutFeedback onPress={() => setSelectedEvent(null)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          {/* The event card content positioned above the overlay */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 12,
  },
  // Root view for modal to stack overlay and content correctly
  modalRoot: {
    flex: 1,
  },
  // Full-screen backdrop behind modal content
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  // Centered modal content container
  modalContent: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
