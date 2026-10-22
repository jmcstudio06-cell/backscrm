/**
 * Meta (Facebook) Pixel.
 * - Loaded once, only in the browser, and only after the visitor has not opted out.
 * - Sends only what the ad platform needs: event name, value and plan/product name.
 *   Never e-mail, phone, names or tokens.
 */

// Public identifier (not a secret). Override with VITE_META_PIXEL_ID when you create the final pixel.
export const META_PIXEL_ID: string = (import.meta.env.VITE_META_PIXEL_ID as string | undefined)?.trim() || "1044336235092961";

const OPT_OUT_KEY = "meta_pixel_opt_out";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: Fbq;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/** Routes that carry private tokens or are only used inside the signed-in/admin flow. */
const UNTRACKED_PREFIXES = ["/assinar/", "/reset-password", "/auth/confirm", "/admin"];

export function isTrackablePath(pathname: string): boolean {
  return !UNTRACKED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isPixelOptedOut(): boolean {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === "1" || navigator.doNotTrack === "1";
  } catch {
    return false;
  }
}

/** Lets a visitor turn the pixel off (e.g. from a privacy setting). */
export function setPixelOptOut(optOut: boolean) {
  try {
    if (optOut) localStorage.setItem(OPT_OUT_KEY, "1");
    else localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    /* ignore */
  }
}

let initialized = false;

function loadPixel(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (!META_PIXEL_ID || isPixelOptedOut()) return false;
  if (initialized) return true;

  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  window.fbq!("init", META_PIXEL_ID);
  initialized = true;
  return true;
}

let lastPageView = "";

export function trackPageView(pathname: string) {
  if (!isTrackablePath(pathname) || !loadPixel()) return;
  // React strict mode and re-renders must not double count the same page.
  if (lastPageView === pathname) return;
  lastPageView = pathname;
  window.fbq!("track", "PageView");
}

type StandardEvent = "CompleteRegistration" | "Lead" | "InitiateCheckout" | "ViewContent" | "Purchase";

interface EventData {
  content_name?: string;
  value?: number;
  currency?: "BRL";
  status?: boolean;
}

/** Sends a standard event. `eventId` lets the server-side API deduplicate the same conversion later. */
export function trackEvent(name: StandardEvent, data: EventData = {}, eventId?: string) {
  if (!loadPixel()) return;
  const payload = { ...data, ...(data.value !== undefined ? { currency: "BRL" as const } : {}) };
  if (eventId) window.fbq!("track", name, payload, { eventID: eventId });
  else window.fbq!("track", name, payload);
}
