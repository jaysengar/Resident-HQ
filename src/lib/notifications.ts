import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

export const registerForPushNotifications = async (userId: string) => {
  // We only want to run this on native devices
  if (!Capacitor.isNativePlatform()) {
    console.log("Push notifications are only available on native devices.");
    return;
  }

  try {
    // Check existing permissions
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn("User denied push notification permissions");
      return;
    }

    // Register with Apple / Google to receive token
    await PushNotifications.register();

    // Listen for registration success
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      
      // Save the token to our Supabase database
      const { error } = await supabase.from('user_fcm_tokens').upsert({
        user_id: userId,
        token: token.value,
        device_platform: Capacitor.getPlatform(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'token' });

      if (error) {
        console.error("Failed to save FCM token to Supabase:", error);
      }
    });

    // Listen for errors
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Listen for incoming notifications while app is open
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ' + JSON.stringify(notification));
      // You can trigger a toast or update local state here
    });

    // Listen for notification tap
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
      // You can navigate the user to a specific screen based on notification.data here
    });

  } catch (error) {
    console.error("Error setting up push notifications:", error);
  }
};
