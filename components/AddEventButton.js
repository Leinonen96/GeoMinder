// components/AddEventButton.js
import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTheme } from 'react-native-paper'; // Import useTheme

export default function AddEventButton({ onPress }) {
  const { colors } = useTheme(); // Access theme colors
  console.log(colors.primary);

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: colors.primary }]} // Use theme's primary color
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, { color: colors.primary }]}>
        + Add Event
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    width: '33%',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 4,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
