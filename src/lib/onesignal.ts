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

function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isOneSignalSubscribed(): boolean {
  try {
    const os = OneSignal as unknown as any;
    return (
      Boolean(os?.Notifications?.permission) &&
      Boolean(os?.User?.PushSubscription?.optedIn) &&
      Boolean(os?.User?.PushSubscription?.id)
    );
  } catch {
    return false;
  }
}

async function ensureOneSignalOptIn(): Promise<void> {
  try {
    const os = OneSignal as unknown as any;

    // In v16 User Model, permission and subscription are separate.
    const canOptIn = Boolean(os?.User?.PushSubscription?.optIn);
    if (!canOptIn) return;

    if (!os.User.PushSubscription.optedIn) {
      await os.User.PushSubscription.optIn();
    }
  } catch (error) {
    console.warn("OneSignal optIn failed:", error);
  }
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
        // Be explicit to avoid SW path issues across domains / PWAs
        serviceWorkerPath: "/OneSignalSDKWorker.js",
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

    // IMPORTANT: On iOS PWA, permission prompt rules are strict.
    // Use OneSignal's slidedown prompt, then ensure opt-in.
    if (isIOSDevice()) {
      console.log("iOS detected, using Slidedown.promptPush()");
      try {
        await OneSignal.Slidedown.promptPush();
      } catch (slidedownError) {
        console.warn("Slidedown.promptPush failed, falling back:", slidedownError);
      }

      // Even with permission granted, user might still be opted-out in OneSignal (v16 user model)
      await ensureOneSignalOptIn();
      const subscribed = isOneSignalSubscribed();
      console.log("iOS OneSignal subscribed:", subscribed);
      return subscribed;
    }

    // Standard path for non-iOS
    const permission = await OneSignal.Notifications.requestPermission();
    console.log("Push permission result:", permission);

    await ensureOneSignalOptIn();
    const subscribed = isOneSignalSubscribed();
    console.log("OneSignal subscribed:", subscribed);

    // If OneSignal's method didn't trigger native prompt, try native API as fallback
    if (!permission && "Notification" in window && Notification.permission === "default") {
      console.log("Falling back to native Notification.requestPermission");
      const nativeResult = await Notification.requestPermission();
      if (nativeResult === "granted") {
        await ensureOneSignalOptIn();
        return isOneSignalSubscribed();
      }
      return false;
    }

    return subscribed;
  } catch (error) {
    console.error("Error requesting push permission:", error);

    // Fallback to native API on error
    if ("Notification" in window && Notification.permission === "default") {
      try {
        const nativeResult = await Notification.requestPermission();
        if (nativeResult === "granted") {
          await ensureOneSignalOptIn();
          return isOneSignalSubscribed();
        }
        return false;
      } catch {
        return false;
      }
    }

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
