// Plays the notification sound when the Service Worker requests it
// (push received while a window is open).

const SOUND_URL = "/sounds/notification.mp3";

let audioEl: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio(SOUND_URL);
    audioEl.preload = "auto";
    audioEl.volume = 0.85;
  }
  return audioEl;
}

export function playNotificationSound() {
  try {
    const a = getAudio();
    a.currentTime = 0;
    void a.play().catch(() => {
      // Autoplay may be blocked until user interacts; that's fine.
    });
  } catch {
    // ignore
  }
}

export function registerNotificationSoundListener() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "PLAY_NOTIFICATION_SOUND") {
      playNotificationSound();
    }
  });
}
