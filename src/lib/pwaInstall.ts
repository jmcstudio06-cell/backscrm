/**
 * Shared PWA install state.
 * Chrome/Edge/Samsung on Android (and desktop) fire `beforeinstallprompt`, which lets us
 * open the native install sheet. iOS never fires it, so iOS users get a tutorial instead.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

export type InstallPlatform = "ios" | "android" | "desktop";

export function getInstallPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

/** Instagram, Facebook, TikTok etc. open links in their own browser, which cannot install apps. */
export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Instagram|FBAN|FBAV|FB_IAB|Line\/|TikTok|musical_ly|Snapchat|LinkedInApp/i.test(navigator.userAgent);
}

/** iOS only allows "Add to Home Screen" from Safari (and from Chrome/Edge on iOS 16.4+ via the share menu). */
export function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return getInstallPlatform() === "ios" && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua) && !isInAppBrowser();
}

export function isAppInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function canPromptInstall(): boolean {
  return deferredPrompt !== null;
}

/** Opens the native install sheet. Returns null when the browser did not offer one. */
export async function promptInstall(): Promise<"accepted" | "dismissed" | null> {
  const event = deferredPrompt;
  if (!event) return null;
  deferredPrompt = null; // a prompt event can only be used once
  notify();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome;
}

export function subscribeInstallState(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
