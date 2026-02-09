import OneSignal from "react-onesignal";

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID;

let initialized = false;
let initPromise: Promise<void> | null = null;

function isValidAppId(appId: unknown): appId is string {
  return (
    typeof appId === "string" &&
    appId.trim().length > 0 &&
    appId !== "PLACEHOLDER_TO_BE_REPLACED"
  );
}

export async function initOneSignal(): Promise<void> {
  if (initialized) return;

  if (!isValidAppId(ONESIGNAL_APP_ID)) {
    console.warn("OneSignal App ID not configured");
    return;
  }

  // Prevent concurrent inits (React 18 StrictMode can run effects twice in dev)
  if (initPromise) return initPromise;

  initPromise = (async () => {
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
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : JSON.stringify(error);

      // OneSignal throws this if init is called twice — treat as success.
      if (message.toLowerCase().includes("already initialized")) {
        initialized = true;
        console.warn("OneSignal already initialized; skipping init");
        return;
      }

      console.error("Error initializing OneSignal:", error);
      throw error;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

export async function promptForPushNotifications(): Promise<boolean> {
  try {
    await initOneSignal();

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
    await initOneSignal();

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
