import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

export default function SelectLocationScreen({ navigation, route }) {
  const { location: userLocation, loading: locationLoading, error: locationError } = useCurrentLocation();
  
  const initialLocation = route.params?.initialLocation
    ? { ...route.params.initialLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : userLocation 
      ? { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }
      : { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.01, longitudeDelta: 0.01 };

  const [region, setRegion] = useState(initialLocation);

  // Update region when userLocation becomes available
  useEffect(() => {
    if (userLocation && !route.params?.initialLocation) {
      setRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      });
    }
  }, [userLocation]);

  const onRegionChangeComplete = newRegion => setRegion(newRegion);

  const confirmLocation = () => {
    const selectedLocation = { latitude: region.latitude, longitude: region.longitude };
    if (route.params?.onLocationSelected) {
      route.params.onLocationSelected(selectedLocation);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialLocation}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
      </MapView>
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
    borderWidth: 2,
    borderColor: '#6200EE',
    backgroundColor: 'transparent',
    borderRadius: 6,
    transform: [{ translateX: -75 }],
  },
  selectButtonText: {
    color: '#6200EE',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
