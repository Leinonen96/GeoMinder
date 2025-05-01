import React, { useState } from 'react';
import { View, StyleSheet, Alert, TextInput } from 'react-native';
import { Button, ActivityIndicator, Text } from 'react-native-paper';
import useAuth from '../hooks/useAuth';

export default function LoginScreen() {
  // Local state for form fields and loading states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Authentication state and functions from custom hook
  const {
    loading: initialLoading,
    request, promptAsync,
    signInWithEmail,
    signUpWithEmail,
    authError
  } = useAuth();

  /**
   * Handles email/password login with validation
   */
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Input Missing', 'Please enter both email and password.');
      return;
    }
    
    setIsSigningIn(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (error) {
      // Error handling done in useAuth hook
    } finally {
      setIsSigningIn(false);
    }
  };

  /**
   * Handles new user registration with validation
   */
  const handleEmailSignup = async () => {
    if (!email || !password) {
      Alert.alert('Input Missing', 'Please enter both email and password.');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password should be at least 6 characters.');
      return;
    }

    setIsSigningIn(true);
    try {
      await signUpWithEmail(email.trim(), password);
    } catch (error) {
      // Error handling done in useAuth hook
    } finally {
      setIsSigningIn(false);
    }
  };

  /**
   * Initiates Google OAuth authentication flow
   */
  const handleGoogleLogin = async () => {
    promptAsync();
  };

  // Show loading state during initial auth check
  if (initialLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text style={{marginTop: 10}}>Checking session...</Text>
      </View>
    );
  }

  // Show loading state during authentication
  if (isSigningIn) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text style={{marginTop: 10}}>Authenticating...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        autoCorrect={false}
        editable={!isSigningIn}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCorrect={false}
        editable={!isSigningIn}
      />

      <Button
        mode="contained"
        onPress={handleEmailLogin}
        style={styles.button}
        disabled={isSigningIn || initialLoading}
      >
        Log In
      </Button>

      <Button
        mode="outlined"
        onPress={handleEmailSignup}
        style={styles.button}
        disabled={isSigningIn || initialLoading}
      >
        Sign Up
      </Button>

      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>OR</Text>
        <View style={styles.separatorLine} />
      </View>

      <Button
        disabled={!request || initialLoading || isSigningIn}
        mode="contained"
        onPress={handleGoogleLogin}
        style={styles.button}
      >
        Login with Google
      </Button>

      {/* Display auth errors if Alert usage is disabled in useAuth hook */}
      {authError && (
        <Text style={styles.errorText}>
          Error: {authError.message || 'Authentication failed'}
        </Text>
      )}
    </View>
  );
}

// UI Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    width: '100%',
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  button: {
    width: '100%',
    marginVertical: 8,
    paddingVertical: 5,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  separatorText: {
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#555',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
    width: '100%',
  }
});