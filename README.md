# GeoMinder

GeoMinder is a mobile application built with React Native for creating location-based event reminders using geofencing. It allows users to define events with specific times and locations and set geofencing triggers that automatically send timely notifications when entering the designated areas.

## Technologies Used

- **React Native**\*: Develops native mobile apps for both Android and iOS with a single JavaScript/React codebase.
- **Expo**: Provides modules and tools for building universal React Native apps quickly, including development builds, location services, notifications, and background tasks.
- **Firebase**:
  - **Firestore**: A NoSQL cloud database storing event data (title, description, times, location, triggers, and image URLs) in real time.
  - **Authentication**: Manages user authentication (anonymous sign‑in) for secure, user‑specific data access.
  - **Storage**: Stores event images; Firestore holds the download URLs.
- **React Navigation**: Implements Stack and Tab navigators to manage screens (List, Map, Add/Edit Event, Location/Trigger Selection).
- **React Native Paper**: A Material Design component library for consistent, cross‑platform UI.
- **Expo Location & TaskManager**:
  - **Location**: Accesses device location and implements geofencing boundaries.
  - **TaskManager**: Runs background tasks for geofence monitoring and notification triggers, even when the app is closed.
- **AsyncStorage**: Local key‑value storage for persisting geofence trigger details so background tasks can access them without network calls.

## Key Features & Capabilities

- **Location Services**: Uses foreground and background tracking for geofencing.
- **Geofencing**: Monitors predefined areas and triggers entry events via background tasks.
- **Notifications**: Sends local alerts when geofence triggers activate.
- **Data Persistence**: Stores event data in Firestore; cached triggers in AsyncStorage; images in Firebase Storage.
- **Image Handling**: Users select device images, upload to Firebase Storage, and link URLs in Firestore.
- **Navigation**: Smooth flow with Stack and Tab navigators.
- **Background Tasks**: Defines a dedicated geofence entry task for notifications.

## Project Structure

```
app/
├─ assets/               # Static assets (images, fonts)
├─ components/           # Reusable UI components (EventCard, AddEventButton)
├─ config/               # Configuration (firebaseConfig, googleConfig)
├─ hooks/                # Custom hooks (useAuth, useEvents, usePermissions, useGeofencing, useTriggers)
├─ navigation/           # Tab navigator definitions
├─ screens/              # Screen components (ListScreen, MapScreen, AddEventScreen, EditEventScreen)
├─ services/             # External service modules (EventService, geofenceService, imageService, locationService, notificationService)
├─ tasks/                # Background tasks (geofenceTask)
└─ utils/                # Utility functions (dateTimeUtils, geofenceHelpers)

App.js                   # Main entry point; sets up providers and navigation
app.json                 # Expo configuration
package.json             # Dependencies and scripts
README.md                # Project documentation
```

