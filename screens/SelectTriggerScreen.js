import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Platform } from 'react-native';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';

export default function SelectTriggerScreen({ navigation, route }) {
  const { initialLocation, initialRadius = 100, onSelect } = route.params;
  const [region, setRegion] = useState({
    ...initialLocation,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // slider percentage (0–1), start at middle
  const [sliderPercent, setSliderPercent] = useState(0.5);

  // meters per degree approx
  const METERS_PER_DEGREE = 111320;
  const { latitudeDelta, longitudeDelta, latitude, longitude } = region;

  // compute visible radius: half of smaller span in meters
  const spanMeters = Math.min(latitudeDelta, longitudeDelta) * METERS_PER_DEGREE;
  const maxRadius = spanMeters / 2;

  // actual radius scaled by slider
  const radius = Math.round(maxRadius * sliderPercent);
  const displayLabel = radius >= 1000 ? `${(radius/1000).toFixed(2)} km` : `${radius} m`;

  const confirm = () => {
    const loc = { latitude, longitude };
    if (typeof onSelect === 'function') onSelect(loc, radius);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation
        onRegionChangeComplete={setRegion}
      >
        <Circle
          center={{ latitude, longitude }}
          radius={radius}
          strokeColor="rgba(0,122,255,0.7)"
          fillColor="rgba(0,122,255,0.3)"
        />
      </MapView>

      <View style={styles.marker} pointerEvents="none">
        <MaterialIcons name="location-pin" size={48} color="red" />
      </View>

      <View style={styles.sliderContainer}>
        <Slider
          style={Platform.OS === 'android' ? styles.sliderAndroid : styles.sliderIOS}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={sliderPercent}
          onValueChange={setSliderPercent}
          {...(Platform.OS === 'ios' ? { orientation: 'vertical' } : {})}
        />
        <Text style={styles.radiusLabel}>{displayLabel}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={confirm}>
        <Text style={styles.buttonText}>Select Area</Text>
      </TouchableOpacity>
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const SLIDER_LENGTH = height * 0.8;
const SLIDER_THICKNESS = 100;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width, height },
  marker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -24,
  },
  sliderContainer: {
    position: 'absolute',
    right: 16,
    top: (height - SLIDER_LENGTH) / 2,
    height: SLIDER_LENGTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderAndroid: {
    width: SLIDER_LENGTH,
    height: SLIDER_THICKNESS,
    transform: [{ rotate: '-90deg' }],
  },
  sliderIOS: {
    width: SLIDER_THICKNESS,
    height: SLIDER_LENGTH,
  },
  radiusLabel: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 16,
  },
  button: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    width: 160,
    padding: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    transform: [{ translateX: -80 }],
  },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
});