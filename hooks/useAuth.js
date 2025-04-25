// src/hooks/useAuth.js
import { useState, useEffect } from 'react'
import * as Google from 'expo-auth-session/providers/google'
import { getAuth, GoogleAuthProvider, signInWithCredential, onAuthStateChanged } from 'firebase/auth'

const auth = getAuth()

export default function useAuth() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:     '<YOUR-ANDROID-CLIENT-ID>',
    iosClientId:  '<YOUR-IOS-CLIENT-ID>',
    expoClientId: '<YOUR-EXPO-CLIENT-ID>',
  })

  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // listen for Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  // when Google flow returns, sign in to Firebase
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params
      const cred = GoogleAuthProvider.credential(id_token)
      signInWithCredential(auth, cred).catch(console.error)
    }
  }, [response])

  return { user, loading, request, promptAsync }
}
