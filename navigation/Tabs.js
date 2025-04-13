// screens/Tabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../screens/MapScreen';

// Optional: Create or import another screen (ListScreen) if needed.
// For now, we'll create a simple placeholder for ListScreen.
function ListScreen() {
  return null; // Or return a simple view indicating a placeholder.
}

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="List" component={ListScreen} />
    </Tab.Navigator>
  );
}
