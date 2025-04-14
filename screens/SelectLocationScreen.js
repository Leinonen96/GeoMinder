import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';

export default function SelectLocationScreen({ navigation, route }) {
  const initialLocation = route.params?.initialLocation
    ? { ...route.params.initialLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.01, longitudeDelta: 0.01 };

  const [region, setRegion] = useState(initialLocation);

  const onRegionChangeComplete = (newRegion) => {
    setRegion(newRegion);
  };

  const confirmLocation = () => {
    const selectedLocation = {
      latitude: region.latitude,
      longitude: region.longitude,
    };

    if (route.params?.onLocationSelected) {
      route.params.onLocationSelected(selectedLocation);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialLocation}
        onRegionChangeComplete={onRegionChangeComplete}
      />
      <View style={styles.markerFixed} pointerEvents="none">
        <MaterialIcons name="location-pin" size={48} color="red" />
      </View>
      <TouchableOpacity style={styles.selectButton} onPress={confirmLocation}>
        <Text style={styles.selectButtonText}>Select Location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  markerFixed: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -48,
  },
  selectButton: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    width: 150,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 6,
    transform: [{ translateX: -75 }],
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
