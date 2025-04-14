// screens/MapScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Dimensions, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import AddEventButton from '../components/AddEventButton';
import RecenterButton from '../components/RecenterButton';

export default function MapScreen({ navigation }) {
  const { colors } = useTheme(); // Access theme colors
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState(null);

  // Reference to the MapView to control its region
  const mapViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      // Request location permission from the user
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission was not granted.');
        return;
      }
      // Fetch the current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      const { latitude, longitude } = currentLocation.coords;
      // Define the map region
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05, // The smaller the value, the closer the zoom
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  if (errorMsg) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{errorMsg || ''}</Text>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator animating={true} color={colors.primary} />
        <Text style={{ color: colors.text }}>Loading map...</Text>
      </View>
    );
  }

  const recenterMap = () => {
    if (mapViewRef.current && region) {
      mapViewRef.current.animateToRegion(region, 1000); // 1000ms animation duration
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        style={styles.map}
        region={region}
        ref={mapViewRef}
        customMapStyle={colors.mapStyle || []} // Optional: Apply custom map style if defined in the theme
      >
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title={region ? "You are here" : ""}
          description={region ? "Your current location" : ""}
        />
      </MapView>
      {/* Existing Add Event button */}
      <AddEventButton onPress={() => navigation.navigate('AddEvent')} />
      {/* New Recenter button */}
      <RecenterButton onPress={recenterMap} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
