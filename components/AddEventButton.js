// components/AddEventButton.js
import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';

export default function AddEventButton({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>+ Add Event</Text>
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
    borderColor: '#6200ee',  // Adjust the border color as needed
    borderWidth: 4,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#6200ee', // Same color as the border to create a hollow look
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
