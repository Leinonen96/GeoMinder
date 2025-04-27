// src/components/EventCard.js
import React from 'react';
import { StyleSheet, View, Image, Text, ScrollView } from 'react-native';
import { Card, Title, useTheme } from 'react-native-paper';

export default function EventCard({ event, onPress }) {
  const { colors } = useTheme();
  const now = Date.now();
  const isActive =
    now >= event.startTime.toMillis() && now <= event.endTime.toMillis();

  const accentColor = isActive ? '#4CAF50' : '#FFEB3B';

  const glowStyle = isActive
    ? {
        shadowColor: accentColor,
        shadowRadius: 16,
        shadowOpacity: 0.6,
        shadowOffset: { width: 0, height: 0 },
        elevation: 8,
      }
    : {};

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
          {/* Header row */}
          <View style={styles.headerRow}>
            {event.thumbnailUrl ? (
              <Image source={{ uri: event.thumbnailUrl }} style={styles.image} />
            ) : (
              <View style={[styles.image, { backgroundColor: '#eee' }]} />
            )}

            <Title numberOfLines={2} style={styles.title}>
              {event.title}
            </Title>
          </View>

          {/* Scrollable description - Modified for consistent behavior */}
          <View 
            style={styles.descriptionWrapper} 
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
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
    flexShrink: 1
  },

  image: {
    width: '50%',
    height: 100,
    borderRadius: 8,
    marginRight: 12,
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
    height: 'auto', // Allow auto-height between min and max constraints
  },

  descriptionContainer: {
    width: '100%',
    height: 'auto', // Allow height to be determined by content
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
  },
  statusText: { fontSize: 12, fontWeight: 'bold' },
});
