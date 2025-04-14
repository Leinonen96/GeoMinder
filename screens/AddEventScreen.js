import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Divider, Snackbar } from 'react-native-paper'; // Import Snackbar
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { signInAnonymously } from 'firebase/auth';

export default function AddEventScreen({ navigation }) {
  // State variables
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [locationCoordinate, setLocationCoordinate] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Helper to combine date and time
  const combineDateAndTime = useCallback((date, time) => {
    if (!date || !time) return null;
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
    return combined;
  }, []);

  // Fetch user's current location on mount
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation(loc.coords);
        }
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    };
    fetchUserLocation();
  }, []);

  // Sign in anonymously if not already signed in
  useEffect(() => {
    const signIn = async () => {
      setIsSigningIn(true);
      try {
        await signInAnonymously(auth);
        console.log('Signed in anonymously:', auth.currentUser?.uid);
      } catch (error) {
        console.error('Error signing in anonymously:', error);
        alert('Failed to sign in anonymously.');
      } finally {
        setIsSigningIn(false);
      }
    };
    if (!auth.currentUser) signIn();
  }, []);

  // Image picker
  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access the media library is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setThumbnail(result.assets[0].uri);
    }
  }, []);

  // Save event to Firestore
  const handleSave = useCallback(async () => {
    if (isSigningIn) {
      alert('Please wait, signing in...');
      return;
    }
    if (!auth.currentUser) {
      alert('Not signed in. Please try again.');
      return;
    }
    const combinedStart = combineDateAndTime(startDate, startTime);
    const combinedEnd = combineDateAndTime(endDate, endTime);
    if (!title || !combinedStart || !combinedEnd) {
      alert('Please fill out the required fields: Title, Start Date & Time, and End Date & Time.');
      return;
    }
    const eventData = {
      userId: auth.currentUser.uid,
      title,
      description,
      startTime: combinedStart,
      endTime: combinedEnd,
      location: locationCoordinate || { latitude: 0, longitude: 0 },
      thumbnailUrl: thumbnail,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      triggers: [],
    };
    try {
      const docRef = await addDoc(collection(db, 'events'), eventData);
      console.log('Event saved with ID:', docRef.id);

      // Show success Snackbar
      setSnackbarMessage('Event saved successfully!');
      setSnackbarVisible(true);

      // Delay navigation to allow Snackbar to display
      setTimeout(() => {
        navigation.goBack();
      }, 3000);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('There was an error saving the event. Please try again.');
    }
  }, [auth.currentUser, combineDateAndTime, description, endDate, endTime, locationCoordinate, navigation, startDate, startTime, thumbnail, title]);

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.header}>Add New Event</Text>

          <TextInput
            label="Event Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            style={[styles.input, { minHeight: 60 }]}
          />

          {/* Start Date & Time */}
          <View style={styles.row}>
            <Button mode="outlined" onPress={() => setShowStartDatePicker(true)} style={styles.datetimeButton}>
              <Text style={styles.datetimeButtonText}>
                {startDate
                  ? `Start Date: ${startDate.toLocaleDateString('en-US')}`
                  : 'Select Start Date'}
              </Text>
            </Button>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowStartDatePicker(false);
                  setStartDate(date);
                }}
              />
            )}

            <Button mode="outlined" onPress={() => setShowStartTimePicker(true)} style={styles.datetimeButton}>
              <Text style={styles.datetimeButtonText}>
                {startTime
                  ? `Start Time: ${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`
                  : 'Select Start Time'}
              </Text>
            </Button>
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime || new Date()}
                mode="time"
                display="default"
                onChange={(event, time) => {
                  setShowStartTimePicker(false);
                  setStartTime(time);
                }}
              />
            )}
          </View>

          {/* End Date & Time */}
          <View style={styles.row}>
            <Button mode="outlined" onPress={() => setShowEndDatePicker(true)} style={styles.datetimeButton}>
              <Text style={styles.datetimeButtonText}>
                {endDate
                  ? `End Date: ${endDate.toLocaleDateString('en-US')}`
                  : 'Select End Date'}
              </Text>
            </Button>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowEndDatePicker(false);
                  setEndDate(date);
                }}
              />
            )}

            <Button mode="outlined" onPress={() => setShowEndTimePicker(true)} style={styles.datetimeButton}>
              <Text style={styles.datetimeButtonText}>
                {endTime
                  ? `End Time: ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`
                  : 'Select End Time'}
              </Text>
            </Button>
            {showEndTimePicker && (
              <DateTimePicker
                value={endTime || new Date()}
                mode="time"
                display="default"
                onChange={(event, time) => {
                  setShowEndTimePicker(false);
                  setEndTime(time);
                }}
              />
            )}
          </View>

          {/* Location */}
          <View style={styles.locationDisplay}>
            <Text style={styles.locationLabel}>Selected Location:</Text>
            <Text style={styles.locationText}>
              {locationCoordinate
                ? `Lat: ${locationCoordinate.latitude.toFixed(4)}, Lng: ${locationCoordinate.longitude.toFixed(4)}`
                : 'None'}
            </Text>
          </View>
          <Button
            mode="outlined"
            onPress={() => {
              const initialLoc = locationCoordinate || userLocation || { latitude: 37.78825, longitude: -122.4324 };
              navigation.navigate('SelectLocation', {
                initialLocation: initialLoc,
                onLocationSelected: setLocationCoordinate,
              });
            }}
            style={styles.input}
          >
            Select on Map
          </Button>

          {/* Thumbnail Picker */}
          <Button mode="outlined" onPress={pickImage}>
            {thumbnail ? 'Change Thumbnail' : 'Select Thumbnail'}
          </Button>

          <Divider style={{ marginVertical: 16 }} />

          {/* Save Button */}
          <Button mode="contained" onPress={handleSave} style={styles.saveButton} disabled={isSigningIn}>
            Save Event
          </Button>
        </View>
      </ScrollView>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{
          backgroundColor: 'white', // Set the background to white
          borderWidth: 2, // Add a border
          borderColor: 'green', // Green border
        }}
      >
        <Text style={{ color: 'green', fontWeight: 'bold' }}>{snackbarMessage}</Text> {/* Green text */}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  datetimeButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  datetimeButtonText: {
    fontSize: 13,
    textAlign: 'center',
    color: '#333',
  },
  locationDisplay: {
    marginBottom: 16,
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  saveButton: {
    marginTop: 16,
  },
});
