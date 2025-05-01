import React, { useEffect } from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import usePermissions from './hooks/usePermissions'
import useGeofencing  from './hooks/useGeofencing'
import './services/firebase'
import './tasks/geofenceTask'

import useAuth         from './hooks/useAuth'
import LoginScreen     from './screens/LoginScreen'
import Tabs            from './navigation/Tabs'
import AddEventScreen  from './screens/AddEventScreen'
import SelectLocation  from './screens/SelectLocationScreen'
import SelectTrigger   from './screens/SelectTriggerScreen'

import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications';

const Stack = createNativeStackNavigator()

// Notification handler configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true, 
    shouldSetBadge: false, 
  }),
});


export default function App() {
  const { user, loading } = useAuth()
  const { requestAll }  = usePermissions()
  


  useEffect(() => {
    Notifications.scheduleNotificationAsync({
      content: { title: '🚀 Test', body: 'Notifications are working!' },
      trigger: { seconds: 5 },
    })
  }, [])

  // 1) Ask for location (fg+bg) and notifications on first mount
  useEffect(() => {
    ;(async () => {
      const { fg, bg, np } = await requestAll()
      if (fg !== 'granted' || bg !== 'granted') {
        alert('Location permissions are required.')
      }
      if (np !== 'granted') {
        alert('Notifications permission is required for geofence alerts.')
      }
    })()
  }, [])

  // 2) Start geofencing only after permission prompt
  useGeofencing()

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerBackTitleVisible: false }}>
          {user ? (
            <>
              <Stack.Screen
                name="Main"
                component={Tabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AddEvent"
                component={AddEventScreen}
                options={{ title: 'Add Event' }}
              />
              <Stack.Screen
                name="SelectLocation"
                component={SelectLocation}
                options={{ title: 'Select Location' }}
              />
              <Stack.Screen
                name="SelectTrigger"
                component={SelectTrigger}
                options={{ title: 'Select Trigger' }}
              />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  loader: { flex:1, justifyContent:'center', alignItems:'center' }
})
