import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

/**
 * ListEventCard component for simplified event display in list view
 * @param {Object} event - Event data object
 * @param {Function} onPress - Callback function when card is pressed
 */
export default function ListEventCard({ event, onPress }) {
  const { colors } = useTheme();
  const now = Date.now();
  const isActive =
    now >= event.startTime.toMillis() && now <= event.endTime.toMillis();

  // Status indicator color
  const accentColor = isActive ? '#4CAF50' : '#FFEB3B';
  
  // Truncate description to 2 lines
  const truncatedDescription = event.description.length > 100 
    ? `${event.description.substring(0, 100)}...` 
    : event.description;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(event)}
      activeOpacity={0.7}
    >
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardContent}>
          {/* Left side - Image */}
          {event.thumbnailUrl ? (
            <Image source={{ uri: event.thumbnailUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, { backgroundColor: '#eee' }]} />
          )}
          
          {/* Right side - Content */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {event.title}
            </Text>
            <Text style={[styles.description, { color: colors.text }]} numberOfLines={2}>
              {truncatedDescription}
            </Text>
          </View>

          {/* Status indicator */}
          <View style={[styles.statusIndicator, { backgroundColor: accentColor }]} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    borderRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
