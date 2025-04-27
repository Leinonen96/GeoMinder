import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../config/firebaseConfig';

// Initialize Firebase with error handling
let app;
let auth;
let db;

try {
  // Check if the config has required fields
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    console.error('Firebase config missing or invalid:', firebaseConfig);
    throw new Error('Invalid Firebase configuration');
  }
  
  // Initialize Firebase with explicit config
  app = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId
  });
  
  // Initialize auth and firestore
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export the Firebase services
export { app, auth, db };
