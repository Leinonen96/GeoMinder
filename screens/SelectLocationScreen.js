import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

export default function SelectLocationScreen({ navigation, route }) {
  const initialLocation = route.params?.initialLocation
    ? { ...route.params.initialLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.01, longitudeDelta: 0.01 };

  const [region, setRegion] = useState(initialLocation);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation(loc.coords);
      }
    })();
  }, []);

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
