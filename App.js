import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import Tabs from './navigation/Tabs';
import AddEventScreen from './screens/AddEventScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
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
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}