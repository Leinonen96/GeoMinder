import React from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import useAuth         from './hooks/useAuth'
import LoginScreen     from './screens/LoginScreen'
import Tabs            from './navigation/Tabs'
import AddEventScreen  from './screens/AddEventScreen'
import SelectLocation  from './screens/SelectLocationScreen'
import SelectTrigger   from './screens/SelectTriggerScreen'


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
  const { user, loading } = useAuth()

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
        <Stack.Navigator>
          {user
            ? <>
                <Stack.Screen
                  name="Main"
                  component={Tabs}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="AddEvent"
                  component={AddEventScreen}
                  options={{ headerShown: true, title: 'Add Event' }}
                />
                <Stack.Screen
                  name="SelectLocation"
                  component={SelectLocation}
                  options={{ headerShown: true, title: 'Select Location' }}
                />
                <Stack.Screen
                  name="SelectTrigger"
                  component={SelectTrigger}
                  options={{ headerShown: true, title: 'Select Trigger' }}
                />
              </>
            : <Stack.Screen name="Login" component={LoginScreen} />
          }
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  loader: { flex:1, justifyContent:'center', alignItems:'center' }
})