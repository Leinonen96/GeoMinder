import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Alert, StyleSheet, ScrollView, Image, SafeAreaView, Platform, StatusBar,
} from 'react-native'
import {
  TextInput, Button, Text, Divider, Snackbar, Switch, IconButton, ProgressBar,
} from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import { signInAnonymously } from 'firebase/auth'
import { auth } from '../config/firebaseConfig'
import EventService from '../services/EventService'
import { useCurrentLocation } from '../hooks/useCurrentLocation'
import { useImagePicker } from '../hooks/useImagePicker'
import { combineDateAndTime } from '../utils/dateTimeUtils'
import useTriggers from '../hooks/useTriggers'

/**
 * Screen for editing an existing event's details
 */
export default function EditEventScreen({ navigation, route }) {
  const { eventId } = route.params

  // --- Form state ---
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const { imageUri: thumbnail, pickImage, setImageUri } = useImagePicker()
  const {
    triggers,
    setTriggers,
    addTrigger,
    toggleTrigger,
    removeTrigger,
    updateTriggerLocation,
  } = useTriggers(navigation, route)
  const [locationCoordinate, setLocationCoordinate] = useState(null)
  const { location: userLocation } = useCurrentLocation()
  
  // --- Date/time fields ---
  const [startDate, setStartDate] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [endTime, setEndTime] = useState(null)

  // --- Date/time picker visibility ---
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showStartTimePicker, setShowStartTimePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = useState(false)

  // --- Async operation states ---
  const [loadingData, setLoadingData] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSavingEvent, setIsSavingEvent] = useState(false)

  // --- Feedback UI state ---
  const [snackbarVisible, setSnackbarVisible] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const showSnackbar = msg => {
    setSnackbarMessage(msg)
    setSnackbarVisible(true)
  }

  /**
   * Fetches event data when screen loads
   */
  useEffect(() => {
    (async () => {
      try {
        const e = await EventService.fetchEventById(eventId)
        if (!e) throw new Error('Event not found')
        
        // Populate form fields from event data
        setTitle(e.title)
        setDescription(e.description || '')
        setLocationCoordinate(e.location)
        if (e.thumbnailUrl) setImageUri(e.thumbnailUrl)
        
        // Handle dates (convert Firestore timestamps to JS Date objects)
        const s = e.startTime.toDate()
        setStartDate(s)
        setStartTime(s)
        const en = e.endTime.toDate()
        setEndDate(en)
        setEndTime(en)
        setTriggers(e.triggers || [])
      } catch (err) {
        console.error(err)
        showSnackbar('Failed to load event')
      } finally {
        setLoadingData(false)
      }
    })()
  }, [eventId])

  /**
   * Ensures user is authenticated before editing
   */
  useEffect(() => {
    (async () => {
      if (!auth.currentUser) {
        setIsSigningIn(true)
        try {
          await signInAnonymously(auth)
        } catch {
          showSnackbar('Sign-in failed')
        } finally {
          setIsSigningIn(false)
        }
      }
    })()
  }, [])

  // Set screen title
  useEffect(() => {
    navigation.setOptions({ headerTitle: 'Edit Event' })
  }, [navigation])

  /**
   * Validates form and saves updated event data
   */
  const handleSave = useCallback(async () => {
    setIsSavingEvent(true)
    
    if (isSigningIn) {
      showSnackbar('Waiting for sign-in…')
      setIsSavingEvent(false)
      return
    }
    
    if (!auth.currentUser) {
      showSnackbar('Not signed in')
      setIsSavingEvent(false)
      return
    }
    
    // Combine date and time components
    const sdt = combineDateAndTime(startDate, startTime)
    const edt = combineDateAndTime(endDate, endTime)
    
    // Validate required fields
    if (!title || !sdt || !edt) {
      showSnackbar('Fill title, start & end')
      setIsSavingEvent(false)
      return
    }

    const updated = {
      title,
      description,
      startTime: sdt,
      endTime: edt,
      location: locationCoordinate || userLocation || { latitude: 0, longitude: 0 },
      thumbnailUrl: thumbnail,
      triggers,
    }

    try {
      await EventService.updateEvent(eventId, updated)
      showSnackbar('Event updated!')
      setTimeout(() => navigation.goBack(), 2000)
    } catch (err) {
      console.error(err)
      showSnackbar('Update failed')
    } finally {
      setIsSavingEvent(false)
    }
  }, [
    title, description, startDate, startTime, endDate, endTime,
    locationCoordinate, thumbnail, triggers, isSigningIn, navigation,
  ])

  /**
   * Confirms and handles event deletion
   */
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete this event?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await EventService.deleteEvent(eventId)
              navigation.goBack()
            } catch (e) {
              console.error(e)
              Alert.alert('Error', 'Could not delete event.')
            }
          },
        },
      ]
    )
  }, [eventId, navigation])

  if (loadingData) {
    return (
      <View style={styles.loading}>
        <ProgressBar indeterminate />
      </View>
    )
  }

  return (
    <>
      <SafeAreaView
        style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text style={styles.header}>Edit Event</Text>

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

            {/* Date & Time Picker section */}
            <View style={styles.row}>
              <Button mode="outlined" onPress={() => setShowStartDatePicker(true)} style={styles.datetimeButton}>
                <Text style={styles.datetimeButtonText}>
                  {startDate ? startDate.toLocaleDateString() : 'Start Date'}
                </Text>
              </Button>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(_, d) => {
                    setShowStartDatePicker(false)
                    d && setStartDate(d)
                  }}
                />
              )}
              <Button mode="outlined" onPress={() => setShowStartTimePicker(true)} style={styles.datetimeButton}>
                <Text style={styles.datetimeButtonText}>
                  {startTime
                    ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Start Time'}
                </Text>
              </Button>
              {showStartTimePicker && (
                <DateTimePicker
                  value={startTime || new Date()}
                  mode="time"
                  display="default"
                  onChange={(_, t) => {
                    setShowStartTimePicker(false)
                    t && setStartTime(t)
                  }}
                />
              )}
            </View>

            <View style={styles.row}>
              <Button mode="outlined" onPress={() => setShowEndDatePicker(true)} style={styles.datetimeButton}>
                <Text style={styles.datetimeButtonText}>
                  {endDate ? endDate.toLocaleDateString() : 'End Date'}
                </Text>
              </Button>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(_, d) => {
                    setShowEndDatePicker(false)
                    d && setEndDate(d)
                  }}
                />
              )}
              <Button mode="outlined" onPress={() => setShowEndTimePicker(true)} style={styles.datetimeButton}>
                <Text style={styles.datetimeButtonText}>
                  {endTime
                    ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'End Time'}
                </Text>
              </Button>
              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime || new Date()}
                  mode="time"
                  display="default"
                  onChange={(_, t) => {
                    setShowEndTimePicker(false)
                    t && setEndTime(t)
                  }}
                />
              )}
            </View>

            {/* Location section */}
            <View style={styles.locationDisplay}>
              <Text style={styles.locationLabel}>Location:</Text>
              <Text style={styles.locationText}>
                {locationCoordinate
                  ? `${locationCoordinate.latitude.toFixed(4)}, ${locationCoordinate.longitude.toFixed(4)}`
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
              Change Location
            </Button>

            {/* Thumbnail section */}
            {thumbnail && <Image source={{ uri: thumbnail }} style={styles.thumbnail} />}
            <Button mode="outlined" onPress={pickImage} style={styles.input}>
              {thumbnail ? 'Change Thumbnail' : 'Select Thumbnail'}
            </Button>

            <Divider style={styles.divider} />

            {/* Geofence Triggers section */}
            {triggers.map((t, i) => (
              <View key={i} style={styles.triggerCard}>
                <View style={styles.row}>
                  <Text>Vibrate</Text>
                  <Switch value={t.vibrate} onValueChange={() => toggleTrigger(i, 'vibrate')} />
                  <Text>Sound</Text>
                  <Switch value={t.sound} onValueChange={() => toggleTrigger(i, 'sound')} />
                </View>
                <Text style={styles.triggerText}>
                  {t.location
                    ? `${t.location.latitude.toFixed(4)}, ${t.location.longitude.toFixed(4)} (r:${t.radius}m)`
                    : 'None'}
                </Text>
                <View style={styles.triggerButtonRow}>
                  <Button
                    mode="outlined"
                    onPress={() =>
                      navigation.navigate('SelectTrigger', {
                        triggerIndex: i,
                        initialLocation: t.location || userLocation,
                        initialRadius: t.radius,
                        onSelect: (loc, radius) => updateTriggerLocation(i, loc, radius),
                      })
                    }
                  >
                    Select Location
                  </Button>
                  <IconButton icon="delete" iconColor="red" size={24} onPress={() => removeTrigger(i)} />
                </View>
              </View>
            ))}
            <Button mode="outlined" onPress={addTrigger} style={{ marginBottom: 16 }}>
              + Add Trigger
            </Button>

            {isSavingEvent && <ProgressBar indeterminate style={{ marginVertical: 8 }} />}

            {/* Action buttons */}
            <Button 
              mode="contained" 
              onPress={handleSave} 
              disabled={isSigningIn || isSavingEvent} 
              style={styles.saveButton}
            >
              {isSavingEvent ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button mode="outlined" onPress={handleDelete} style={styles.deleteButton} icon="delete">
              Delete Event
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
        {snackbarMessage}
      </Snackbar>
    </>
  )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
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
    loading: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        marginBottom: 16,
    },
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
    thumbnail: {
        width: 200,
        height: 150,
        borderRadius: 8,
        alignSelf: 'center',
        marginBottom: 16,
    },
    divider: {
        marginVertical: 16,
    },
    triggerCard: {
        marginVertical: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
    },
    triggerText: {
        marginBottom: 8,
    },
    triggerButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    saveButton: {
        marginTop: 16,
    },
    deleteButton: {
        marginTop: 8,
        borderColor: 'red',
        backgroundColor: '#fff',
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
