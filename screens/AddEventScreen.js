// screens/AddEventScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Divider,
  Snackbar,
  Switch,
  IconButton,
  ProgressBar,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import EventService from '../services/EventService';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useImagePicker } from '../hooks/useImagePicker';
import { combineDateAndTime } from '../utils/dateTimeUtils';
import useTriggers from '../hooks/useTriggers';

export default function AddEventScreen({ navigation, route }) {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { imageUri: thumbnail, pickImage } = useImagePicker();
  const {
    triggers,
    setTriggers,
    addTrigger,
    toggleTrigger,
    removeTrigger,
    updateTriggerLocation,
  } = useTriggers(navigation, route);
  const [locationCoordinate, setLocationCoordinate] = useState(null);
  const { location: userLocation } = useCurrentLocation();
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // Pickers visibility
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Async state
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Ensure anonymous auth
  useEffect(() => {
    const signIn = async () => {
      setIsSigningIn(true);
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error('Anonymous sign-in failed', err);
        alert('Unable to sign in. Please try again.');
      } finally {
        setIsSigningIn(false);
      }
    };
    if (!auth.currentUser) {
      signIn();
    }
  }, []);

  // Configure header
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Add Event',
      headerBackTitleVisible: false,
    });
  }, [navigation]);

  // Save via EventService, then go back
  const handleSave = useCallback(async () => {
    setIsSavingEvent(true);

    if (isSigningIn) {
      alert('Waiting for sign-in to complete…');
      setIsSavingEvent(false);
      return;
    }
    if (!auth.currentUser) {
      alert('Not signed in. Please try again.');
      setIsSavingEvent(false);
      return;
    }

    const combinedStart = combineDateAndTime(startDate, startTime);
    const combinedEnd = combineDateAndTime(endDate, endTime);
    if (!title || !combinedStart || !combinedEnd) {
      alert('Please fill Title, Start date/time and End date/time.');
      setIsSavingEvent(false);
      return;
    }

    const eventData = {
      title,
      description,
      startTime: combinedStart,
      endTime: combinedEnd,
      location: locationCoordinate || { latitude: 0, longitude: 0 },
      thumbnailUrl: thumbnail,
      triggers,
    };

    try {
      const newId = await EventService.saveEvent(eventData);
      console.log('Saved event id:', newId);
      setSnackbarMessage('Event saved!');
      setSnackbarVisible(true);
      setIsSavingEvent(false);

      setTimeout(() => navigation.goBack(), 3000);
    } catch (err) {
      console.error('Save failed', err);
      alert('Error saving event. Please try again.');
      setIsSavingEvent(false);
    }
  }, [
    title,
    description,
    startDate,
    startTime,
    endDate,
    endTime,
    locationCoordinate,
    thumbnail,
    triggers,
    isSigningIn,
    navigation,
  ]);

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#fff',
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        }}
      >
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

            {/* Date & Time Pickers */}
            <View style={styles.row}>
              <Button
                mode="outlined"
                onPress={() => setShowStartDatePicker(true)}
                style={styles.datetimeButton}
              >
                <Text style={styles.datetimeButtonText}>
                  {startDate
                    ? startDate.toLocaleDateString()
                    : 'Select Start Date'}
                </Text>
              </Button>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowStartDatePicker(false);
                    setStartDate(date);
                  }}
                />
              )}

              <Button
                mode="outlined"
                onPress={() => setShowStartTimePicker(true)}
                style={styles.datetimeButton}
              >
                <Text style={styles.datetimeButtonText}>
                  {startTime
                    ? startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Select Start Time'}
                </Text>
              </Button>
              {showStartTimePicker && (
                <DateTimePicker
                  value={startTime || new Date()}
                  mode="time"
                  display="default"
                  onChange={(_, time) => {
                    setShowStartTimePicker(false);
                    setStartTime(time);
                  }}
                />
              )}
            </View>

            <View style={styles.row}>
              <Button
                mode="outlined"
                onPress={() => setShowEndDatePicker(true)}
                style={styles.datetimeButton}
              >
                <Text style={styles.datetimeButtonText}>
                  {endDate
                    ? endDate.toLocaleDateString()
                    : 'Select End Date'}
                </Text>
              </Button>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowEndDatePicker(false);
                    setEndDate(date);
                  }}
                />
              )}

              <Button
                mode="outlined"
                onPress={() => setShowEndTimePicker(true)}
                style={styles.datetimeButton}
              >
                <Text style={styles.datetimeButtonText}>
                  {endTime
                    ? endTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Select End Time'}
                </Text>
              </Button>
              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime || new Date()}
                  mode="time"
                  display="default"
                  onChange={(_, time) => {
                    setShowEndTimePicker(false);
                    setEndTime(time);
                  }}
                />
              )}
            </View>

            {/* Location */}
            <View style={styles.locationDisplay}>
              <Text style={styles.locationLabel}>Location:</Text>
              <Text style={styles.locationText}>
                {locationCoordinate
                  ? `${locationCoordinate.latitude.toFixed(
                      4
                    )}, ${locationCoordinate.longitude.toFixed(4)}`
                  : 'None'}
              </Text>
            </View>
            <Button
              mode="outlined"
              onPress={() =>
                navigation.navigate('SelectLocation', {
                  initialLocation: locationCoordinate || userLocation,
                  onLocationSelected: setLocationCoordinate,
                })
              }
              style={styles.input}
            >
              Select on Map
            </Button>

            {/* Thumbnail */}
            {thumbnail && (
              <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
            )}
            <Button mode="outlined" onPress={pickImage}>
              {thumbnail ? 'Change Thumbnail' : 'Select Thumbnail'}
            </Button>

            <Divider style={{ marginVertical: 16 }} />

            {/* Triggers */}
            {triggers.map((t, i) => (
              <View key={i} style={styles.triggerCard}>
                <View style={styles.row}>
                  <Text>Vibrate</Text>
                  <Switch
                    value={t.vibrate}
                    onValueChange={() => toggleTrigger(i, 'vibrate')}
                  />
                  <Text>Sound</Text>
                  <Switch
                    value={t.sound}
                    onValueChange={() => toggleTrigger(i, 'sound')}
                  />
                </View>
                <Text>
                  Location:{' '}
                  {t.location
                    ? `${t.location.latitude.toFixed(
                        4
                      )}, ${t.location.longitude.toFixed(4)} (r:${t.radius}m)`
                    : 'None'}
                </Text>
                <View style={styles.triggerButtonRow}>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      navigation.navigate('SelectTrigger', {
                        triggerIndex: i,
                        initialLocation:
                          t.location || userLocation || { latitude: 0, longitude: 0 },
                        initialRadius: t.radius,
                        onSelect: (loc, radius) => {
                          updateTriggerLocation(i, loc, radius);
                        },
                      })
                    }
                  >
                    Select Location
                  </Button>
                  <IconButton
                    icon="delete"
                    iconColor="red"
                    size={24}
                    onPress={() => removeTrigger(i)}
                  />
                </View>
              </View>
            ))}
            <Button mode="outlined" onPress={addTrigger} style={{ marginBottom: 16 }}>
              + Add Trigger
            </Button>

            <Divider style={{ marginVertical: 16 }} />

            {isSavingEvent && <ProgressBar indeterminate style={{ marginVertical: 8 }} />}

            <Button
              mode="contained"
              onPress={handleSave}
              disabled={isSigningIn || isSavingEvent}
              style={styles.saveButton}
            >
              {isSavingEvent ? 'Saving…' : 'Save Event'}
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        <Text style={styles.snackbarText}>{snackbarMessage}</Text>
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
  },
  datetimeButtonText: {
    fontSize: 13,
    textAlign: 'center',
  },
  locationDisplay: {
    marginBottom: 16,
    alignItems: 'center',
  },
  locationLabel: {
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 14,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  thumbnail: {
    width: 200,
    height: 150,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  triggerCard: {
    marginVertical: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  triggerButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButton: {
    marginTop: 16,
  },
  snackbar: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'green',
  },
  snackbarText: {
    color: 'green',
    fontWeight: 'bold',
  },
});
