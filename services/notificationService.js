// services/notificationService.js
import * as Notifications from 'expo-notifications'

export async function initNotificationChannel() {
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.HIGH,
    sound: true,
    vibrate: true,
  })
}

export async function sendNotification(event, { sound, vibrate }) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: event.title,
      body:  event.description,
      sound: sound ? 'default' : null,
      vibrate: vibrate,
      data: { eventId: event.eventId },
    },
    trigger: null,
  })
}
