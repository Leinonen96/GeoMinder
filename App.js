import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper'; // Removed MD3DarkTheme import
import { StatusBar } from 'react-native'; // Correct import
import Tabs from './navigation/Tabs';
import AddEventScreen from './screens/AddEventScreen';
import SelectLocationScreen from './screens/SelectLocationScreen';
import SelectTriggerScreen from './screens/SelectTriggerScreen';


const Stack = createNativeStackNavigator();

// Commented out the theme for now
// const darkTheme = {
//   ...MD3DarkTheme,
//   colors: {
//     ...MD3DarkTheme.colors,
//     primary: '#BB86FC',
//     accent: '#03DAC6',
//     background: '#121212',
//     text: '#FFFFFF',
//   },
// };

export default function App() {
  return (
    <PaperProvider>
      <StatusBar barStyle="light-content" /> {/* Correct usage */}
      <NavigationContainer>
        <Stack.Navigator>
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
            component={SelectLocationScreen}
            options={{ title: 'Select Location' }}
          />
          <Stack.Screen
            name="SelectTrigger"
            component={SelectTriggerScreen}
            options={{ title: 'Select Trigger' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}