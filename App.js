// src/App.js
import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Alert, Text, Platform } from 'react-native';
import { Provider as PaperProvider, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import { NavigationContainer, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';

import useAuth from './hooks/useAuth';
import usePermissions from './hooks/usePermissions';
import useGeofencing from './hooks/useGeofencing';

import LoginScreen from './screens/LoginScreen';
import Tabs from './navigation/Tabs';
import AddEventScreen from './screens/AddEventScreen';
import SelectLocation from './screens/SelectLocationScreen';
import SelectTrigger from './screens/SelectTriggerScreen';
import EditEvent from './screens/EditEventScreen';

import './tasks/geofenceTask'; // defines the background geofence TaskManager task

// Light theme for react-native-paper
const LightPaperTheme = {
  ...PaperDefaultTheme,
  dark: false,
  colors: {
    ...PaperDefaultTheme.colors,
    background: '#ffffff',
    surface: '#ffffff',
    primary: '#6200ee',
    text: '#000000',
  },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createNativeStackNavigator();

export default function App() {
  const { user, loading } = useAuth();
  const { requestAll } = usePermissions();

  // schedule a quick test notification
  useEffect(() => {
    Notifications.scheduleNotificationAsync({
      content: { title: '🚀 App Started', body: 'GeoMinder is running!' },
      trigger: { seconds: 5 },
    }).catch(console.error);
  }, []);

  // prompt for location & notifications permissions on first mount
  useEffect(() => {
    (async () => {
      const { fg, bg, np } = await requestAll();
      if (fg !== 'granted' || bg !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Foreground & background location are needed for geofencing.'
        );
      }
      if (np !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Notifications permission is required for alerts.'
        );
      }
    })();
  }, []);

  // register/unregister geofences whenever your events change
  useGeofencing();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading session…</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={LightPaperTheme}>
      <NavigationContainer theme={NavDefaultTheme}>
        <Stack.Navigator screenOptions={{ headerBackTitleVisible: false }}>
          {user ? (
            <>
              <Stack.Screen
                name="Main"
                component={Tabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="AddEvent"  component={AddEventScreen} options={{ title: 'Add Event' }} />
              <Stack.Screen name="EditEvent" component={EditEvent}    options={{ title: 'Edit Event' }} />
              <Stack.Screen name="SelectLocation" component={SelectLocation} options={{ title: 'Location' }} />
              <Stack.Screen name="SelectTrigger"  component={SelectTrigger}  options={{ title: 'Trigger' }} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
