// src/screens/LoginScreen.js
import React from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { Button, ActivityIndicator } from 'react-native-paper'
import useAuth from '../hooks/useAuth'

export default function LoginScreen() {
  const { user, loading, request, promptAsync } = useAuth()

  // once `user` is set, navigation will swap away from this screen
  const onPress = async () => {
    try {
      await promptAsync()
    } catch {
      Alert.alert('Sign-in Failed', 'Please try again')
    }
  }

  return (
    <View style={styles.container}>
      {loading
        ? <ActivityIndicator size="large" />
        : <Button
            disabled={!request}
            mode="contained"
            onPress={onPress}
          >
            Login with Google
          </Button>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center' }
})
