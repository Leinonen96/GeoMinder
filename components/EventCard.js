import React from 'react';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import { Card, Title, useTheme, Text, Button } from 'react-native-paper';

// EventCard component displays event details and handles user interactions
export default function EventCard({ event, onPress, onViewDetails }) {
  const { colors } = useTheme();

  const now = Date.now();
  // Check if the event is currently active
  const isActive =
    event.startTime && event.startTime.toMillis && now >= event.startTime.toMillis() &&
    event.endTime && event.endTime.toMillis && now <= event.endTime.toMillis();

  const accentColor = isActive ? '#4CAF50' : '#FFEB3B'; // Green for active, Yellow for inactive

  const glowStyle = isActive
    ? {
        shadowColor: accentColor,
        shadowRadius: 16,
        shadowOpacity: 0.6,
        shadowOffset: { width: 0, height: 0 },
        elevation: 8, // Android shadow
      }
    : {}; // No glow for inactive

  // Handle "View Details" button press
  const handleViewDetailsPress = () => {
    if (onViewDetails && event && event.id) {
      console.log(`EventCard: Calling onViewDetails callback for event ID: ${event.id}`);
      onViewDetails(event.id);
    } else {
      console.warn("EventCard: onViewDetails callback or event/event.id is missing.");
    }
  };

  return (
    <View style={[styles.animatedWrapper, glowStyle]}>
      <Card
        onPress={onPress}
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: accentColor },
        ]}
      >
        <View style={styles.inner}>
          {/* Header row with thumbnail and title */}
          <View style={styles.headerRow}>
            {event.thumbnailUrl ? (
              <Image source={{ uri: event.thumbnailUrl }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={[styles.image, { backgroundColor: '#eee' }]} /> // Placeholder for missing image
            )}
            <Title numberOfLines={2} style={styles.title}>
              {event.title}
            </Title>
          </View>

          {/* Scrollable description */}
          <View
            style={styles.descriptionWrapper}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()} // Prevent modal closing on touch
          >
            <ScrollView
              style={styles.descriptionContainer}
              contentContainerStyle={styles.descriptionContent}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              scrollIndicatorInsets={{ right: 1 }}
              persistentScrollbar={true}
              scrollEventThrottle={16}
              directionalLockEnabled={true}
              overScrollMode="always"
            >
              <Text
                style={[styles.description, { color: colors.text }]}
                selectable={true}
                onPress={(e) => e.stopPropagation()}
                onLongPress={(e) => e.stopPropagation()}
                textBreakStrategy="highQuality"
              >
                {event.description}
              </Text>
            </ScrollView>
          </View>

          {/* Status tag */}
          <View
            style={[
              styles.statusTag,
              {
                borderColor: accentColor,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: accentColor }]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>

          {/* View Details Button */}
          <Button
            mode="text"
            onPress={handleViewDetailsPress}
            style={styles.detailsButton}
            labelStyle={styles.detailsButtonLabel}
          >
            View Details
          </Button>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  animatedWrapper: { borderRadius: 16 },

  card: {
    width: '90%',
    borderRadius: 12,
    borderWidth: 2,
    marginVertical: 12,
    alignSelf: 'center',
    overflow: 'visible',
    elevation: 4,
  },

  inner: {
    padding: 16,
    position: 'relative',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  title: {
    fontSize: 18,
    flexShrink: 1,
    fontWeight: 'bold',
  },

  image: {
    width: '50%',
    height: 100,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'cover',
  },

  descriptionWrapper: {
    minHeight: 50,
    maxHeight: 300,
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
    position: 'relative',
    zIndex: 2,
    height: 'auto',
  },

  descriptionContainer: {
    width: '100%',
    height: 'auto',
  },

  descriptionContent: {
    padding: 12,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
  },

  statusTag: {
    position: 'absolute',
    top: -10,
    right: -10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: { fontSize: 12, fontWeight: 'bold' },

  detailsButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  detailsButtonLabel: {
    fontSize: 14,
  },
});