/**
 * Utilitário para abrir links externos corretamente no Android (Capacitor).
 *
 * No ambiente nativo, usa @capacitor/browser para abrir no browser do sistema.
 * No web normal, usa window.open como sempre.
 */

const isCapacitor = () =>
  typeof (window as any).Capacitor !== "undefined" &&
  (window as any).Capacitor.isNativePlatform?.();

export async function openExternalUrl(url: string): Promise<void> {
  if (!url) return;

  if (isCapacitor()) {
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url, presentationStyle: "fullscreen" });
      return;
    } catch (err) {
      console.debug("[Browser] Fallback para window.open:", err);
    }
  }

  // Fallback web
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function closeCapacitorBrowser(): Promise<void> {
  if (!isCapacitor()) return;
  try {
    const { Browser } = await import("@capacitor/browser");
    await Browser.close();
  } catch {
    // ignora
  }
}
