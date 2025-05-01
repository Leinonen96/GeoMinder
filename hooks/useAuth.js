import { useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import {
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  AuthError
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { Alert } from 'react-native';

export default function useAuth() {
  const [user, setUser] = useState(null); // Current authenticated user
  const [loading, setLoading] = useState(true); // Tracks initial auth state check
  const [authError, setAuthError] = useState(null); // Last authentication error

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
  });

  /**
   * Signs in a user with email and password.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @returns {Promise<void>}
   */
  const signInWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      console.log("useAuth: Attempting email sign in with:", email);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("useAuth: Email sign in successful.");
    } catch (error) {
      console.error("useAuth: Email sign in error:", error);
      setAuthError(error);
      let errorMessage = 'Sign-in failed. Please check your credentials.';
      if (error instanceof AuthError) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No user found with this email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format.';
            break;
          default:
            errorMessage = `Sign-in failed: ${error.message}`;
        }
      }
      Alert.alert('Login Failed', errorMessage);
      throw error;
    }
  };

  /**
   * Creates a new user with email and password.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @returns {Promise<void>}
   */
  const signUpWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      console.log("useAuth: Attempting email sign up with:", email);
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("useAuth: Email sign up successful.");
    } catch (error) {
      console.error("useAuth: Email sign up error:", error);
      setAuthError(error);
      let errorMessage = 'Sign-up failed. Please try again.';
      if (error instanceof AuthError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already in use.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format.';
            break;
          default:
            errorMessage = `Sign-up failed: ${error.message}`;
        }
      }
      Alert.alert('Sign-up Failed', errorMessage);
      throw error;
    }
  };

  /**
   * Signs out the current user.
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    setAuthError(null);
    try {
      console.log("useAuth: Attempting to sign out.");
      await firebaseSignOut(auth);
      console.log("useAuth: Sign out successful.");
    } catch (error) {
      console.error("useAuth: Sign out error:", error);
      setAuthError(error);
      Alert.alert('Sign Out Failed', `Could not sign out: ${error.message}`);
      throw error;
    }
  };

  // Sets up a listener to track authentication state changes.
  useEffect(() => {
    console.log("useAuth: Setting up auth state listener.");
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("useAuth: Auth state changed. User:", u ? u.uid : null);
      setUser(u);
      setLoading(false);
      setAuthError(null);
    });
    return unsub;
  }, [auth]);

  // Handles Google auth-session responses and signs in with Firebase.
  useEffect(() => {
    if (response?.type === 'success') {
      console.log("useAuth: Google auth-session success.");
      setAuthError(null);
      const { id_token } = response.params;
      const cred = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, cred)
        .then(() => console.log("useAuth: Google sign-in successful."))
        .catch((e) => {
          console.error("useAuth: Google sign-in failed:", e);
          setAuthError(e);
          Alert.alert('Google Sign-in Failed', `Could not log in: ${e.message}`);
        });
    } else if (response?.type === 'error') {
      console.error("useAuth: Google auth-session error:", response.error);
      const error = new Error(response.error?.message || 'Google sign-in failed.');
      setAuthError(error);
      Alert.alert('Google Sign-in Failed', error.message);
    }
  }, [response, auth]);

  return {
    user,
    loading,
    authError,
    request,
    promptAsync,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
}