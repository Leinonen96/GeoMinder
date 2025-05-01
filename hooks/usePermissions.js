// hooks/usePermissions.js
import * as Location      from 'expo-location'
import * as Notifications from 'expo-notifications'

export default function usePermissions() {
  const requestAll = async () => {
    const { status: fg } = await Location.requestForegroundPermissionsAsync()
    const { status: bg } = await Location.requestBackgroundPermissionsAsync()
    const { status: np } = await Notifications.requestPermissionsAsync()
    return { fg, bg, np }
  }

  return { requestAll }
}
