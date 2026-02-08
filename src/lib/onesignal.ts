import OneSignal from "react-onesignal";

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;

let initialized = false;

export async function initOneSignal(): Promise<void> {
  if (initialized || !ONESIGNAL_APP_ID) {
    if (!ONESIGNAL_APP_ID) {
      console.warn("OneSignal App ID not configured");
    }
    return;
  }

  try {
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      safari_web_id: undefined,
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerParam: {
        scope: "/",
      },
    });

    initialized = true;
    console.log("OneSignal initialized successfully");
  } catch (error) {
    console.error("Error initializing OneSignal:", error);
  }
}

export async function promptForPushNotifications(): Promise<boolean> {
  try {
    if (!initialized) {
      await initOneSignal();
    }

    const permission = await OneSignal.Notifications.requestPermission();
    console.log("Push permission result:", permission);
    return permission;
  } catch (error) {
    console.error("Error requesting push permission:", error);
    return false;
  }
}

export async function setExternalUserId(userId: string): Promise<void> {
  try {
    if (!initialized) {
      await initOneSignal();
    }

    await OneSignal.login(userId);
    console.log("OneSignal user ID set:", userId);
  } catch (error) {
    console.error("Error setting OneSignal user ID:", error);
  }
}

export async function removeExternalUserId(): Promise<void> {
  try {
    await OneSignal.logout();
    console.log("OneSignal user logged out");
  } catch (error) {
    console.error("Error logging out OneSignal user:", error);
  }
}

export async function isPushSupported(): Promise<boolean> {
  return OneSignal.Notifications.isPushSupported();
}

export async function getNotificationPermission(): Promise<string> {
  return OneSignal.Notifications.permission ? "granted" : "default";
}

export { OneSignal };
