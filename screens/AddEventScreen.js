import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Platform, ScrollView } from 'react-native'; // Import ScrollView
import { TextInput, Button, Text, Divider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig'; // Adjust the path as necessary
import { signInAnonymously } from "firebase/auth"; // Import signInAnonymously REMEBER TO REMOVE

export default function AddEventScreen({ navigation }) {
  // Basic event fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [thumbnail, setThumbnail] = useState(null);

  // Separate start date and time states
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);

  // Separate end date and time states
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);

  // Visibility for pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // State to track if signing in anonymously
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Helper to combine date and time into one Date object
  const combineDateAndTime = (date, time) => {
    if (!date || !time) return null;
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
    return combined;
  };

  // --- Date/Time Picker Handlers ---
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    setStartDate(selectedDate);
  };

  const onStartTimeChange = (event, selectedTime) => {
    if (event?.type === 'dismissed') {
      setShowStartTimePicker(false);
      return;
    }
    setStartTime(selectedTime);
    setShowStartTimePicker(false);
  };

  const onEndDateChange = (event, selectedDate) => {
    if (event?.type === 'dismissed') {
      setShowEndDatePicker(false);
      return;
    }
    setEndDate(selectedDate);
    setShowEndDatePicker(false);
  };

  const onEndTimeChange = (event, selectedTime) => {
    if (event?.type === 'dismissed') {
      setShowEndTimePicker(false);
      return;
    }
    setEndTime(selectedTime);
    setShowEndTimePicker(false);
  };

  const pickImage = async () => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access the media library is required!');
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Use MediaTypeOptions.Images for images
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setThumbnail(result.assets[0].uri); // Set the selected image URI
    }
  };

  useEffect(() => {
    const signIn = async () => {
      setIsSigningIn(true); // Set signing in state to true
      try {
        await signInAnonymously(auth);
        console.log("Signed in anonymously:", auth.currentUser?.uid); // Log the user's UID
      } catch (error) {
        console.error("Error signing in anonymously:", error);
        alert("Failed to sign in anonymously.");
      } finally {
        setIsSigningIn(false); // Set signing in state to false regardless of success
      }
    };

    if (!auth.currentUser) {
      signIn();
    }
  }, []);

  // --- Handler to Save Event to Firestore ---
  const handleSave = async () => {

    if (isSigningIn) {
      alert("Please wait, signing in...");
      return;
    }

    if (!auth.currentUser) {
      alert("Not signed in. Please try again.");
      return;
    }

    // Combine start date and time, and end date and time
    const combinedStart = combineDateAndTime(startDate, startTime);
    const combinedEnd = combineDateAndTime(endDate, endTime);

    if (!title || !combinedStart || !combinedEnd) {
      alert("Please fill out the required fields: Title, Start Date & Time, and End Date & Time.");
      return;
    }
    const eventData = {
      userId: auth.currentUser.uid, // Use the current user's UID
      title,
      description,
      startTime: combinedStart, // You might want to convert these to Firestore Timestamps
      endTime: combinedEnd,
      location: {
        latitude: 0,    // Placeholder; integrate a map picker for location
        longitude: 0,   // Placeholder
        address,        // Entered address or value from reverse geocoding/map picker
      },
      thumbnailUrl: thumbnail, // Later: upload to Firebase Storage and store the download URL
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      triggers: [] // Initially empty (can add up to 5 triggers later)
    };

    try {
      const docRef = await addDoc(collection(db, 'events'), eventData);
      console.log("Event saved with ID:", docRef.id);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("There was an error saving the event. Please try again.");
    }
  };

  return (
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
          style={[styles.input, { minHeight: 60 }]} // Minimum height for the input
        />

        {/* Start Row */}
        <View style={styles.row}>
          <Button
            mode="outlined"
            onPress={() => setShowStartDatePicker(true)}
            style={[styles.input, styles.datetimeButton]}
          >
            <Text style={styles.datetimeButtonText}>
              {startDate
                ? `Start Date: ${startDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}`
                : "Select Start Date"}
            </Text>
          </Button>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={onStartDateChange}
            />
          )}

          <Button
            mode="outlined"
            onPress={() => setShowStartTimePicker(true)}
            style={[styles.input, styles.datetimeButton]}
          >
            <Text style={styles.datetimeButtonText}>
              {startTime
                ? `Start Time: ${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`
                : "Select Start Time"}
            </Text>
          </Button>
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime || new Date()}
              mode="time"
              display="default"
              onChange={onStartTimeChange}
            />
          )}
        </View>

        {/* End Row */}
        <View style={styles.row}>
          <Button
            mode="outlined"
            onPress={() => setShowEndDatePicker(true)}
            style={[styles.input, styles.datetimeButton]}
          >
            <Text style={styles.datetimeButtonText}>
              {endDate
                ? `End Date: ${endDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}`
                : "Select End Date"}
            </Text>
          </Button>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={onEndDateChange}
            />
          )}

          <Button
            mode="outlined"
            onPress={() => setShowEndTimePicker(true)}
            style={[styles.input, styles.datetimeButton]}
          >
            <Text style={styles.datetimeButtonText}>
              {endTime
                ? `End Time: ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`
                : "Select End Time"}
            </Text>
          </Button>
          {showEndTimePicker && (
            <DateTimePicker
              value={endTime || new Date()}
              mode="time"
              display="default"
              onChange={onEndTimeChange}
            />
          )}
        </View>

        <TextInput
          label="Event Address"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          style={styles.input}
        />

        {/* Thumbnail Picker */}
        <Button mode="outlined" onPress={pickImage}>
          {thumbnail && (
            <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
          )}
          {!thumbnail && "Select Thumbnail"}
        </Button>

        <Divider style={{ marginVertical: 16 }} />

        <Button mode="contained" onPress={handleSave} style={styles.saveButton} disabled={isSigningIn}>
          Save Event
        </Button>
      </View>
    </ScrollView>
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
    backgroundColor: '#333', // Dark background for buttons
  },
  datetimeButtonText: {
    fontSize: 13,
    textAlign: 'center',
    color: '#fff', // Light text color for contrast
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#121212', // Dark background for the screen
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212', // Dark background for the container
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff', // Light text color for the header
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#333', // Dark background for inputs
    color: '#fff', // Light text color for inputs
  },
  thumbnail: {
    width: 200,
    height: 150,
    resizeMode: 'cover',
    marginBottom: 16,
    alignSelf: 'center',
    borderColor: '#555', // Border for better visibility
    borderWidth: 1,
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: '#6200ee', // Primary color for the save button
  },
});
