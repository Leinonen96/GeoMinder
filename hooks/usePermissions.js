import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

/**
 * Hook to manage and request app permissions
 * Handles location (foreground/background) and notification permissions
 */
export default function usePermissions() {
  /**
   * Requests all required permissions for app functionality
   * @returns {Promise<{fg: string, bg: string, np: string}>} Status of each permission
   */
  const requestAll = async () => {
    console.log("usePermissions: Requesting foreground location permission...");
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    
    console.log("usePermissions: Requesting background location permission...");
    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    
    console.log("usePermissions: Requesting notification permission...");
    const { status: np } = await Notifications.requestPermissionsAsync();

    console.log(`usePermissions: Permissions requested. Foreground=${fg}, Background=${bg}, Notifications=${np}`);

    return { fg, bg, np };
  };

  return { requestAll };
}