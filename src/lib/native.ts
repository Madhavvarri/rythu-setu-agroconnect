/**
 * Native (Capacitor / Android) runtime integration.
 *
 * Everything here is a no-op in the browser, so the web build behaves exactly
 * as before. Only when running inside the Android WebView do we wire up the
 * hardware back button, the status bar and external-link handling.
 */
import { Capacitor } from "@capacitor/core";

export const isNativeApp = () => Capacitor.isNativePlatform();

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url) && !url.startsWith(window.location.origin);
}

/**
 * Initialise native behaviour. Returns a cleanup function.
 * `onBack` should return true when the app handled the back press itself.
 */
export function initNative(onBack: () => boolean): () => void {
  if (typeof window === "undefined" || !isNativeApp()) return () => {};

  const cleanups: Array<() => void> = [];

  // Status bar: keep content below the bar, brand-coloured background.
  void import("@capacitor/status-bar")
    .then(async ({ StatusBar, Style }) => {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: "#1b7f4b" });
    })
    .catch(() => {});

  // Android hardware back button: go back in history, exit at the root.
  void import("@capacitor/app")
    .then(async ({ App }) => {
      const handle = await App.addListener("backButton", ({ canGoBack }) => {
        if (onBack()) return;
        if (canGoBack || window.history.length > 1) {
          window.history.back();
        } else {
          void App.exitApp();
        }
      });
      cleanups.push(() => void handle.remove());
    })
    .catch(() => {});

  // External links open in the system browser instead of replacing the app.
  const linkHandler = (event: MouseEvent) => {
    const anchor = (event.target as HTMLElement | null)?.closest?.("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || !isExternalUrl(href)) return;
    event.preventDefault();
    void import("@capacitor/browser").then(({ Browser }) => Browser.open({ url: href }));
  };
  document.addEventListener("click", linkHandler);
  cleanups.push(() => document.removeEventListener("click", linkHandler));

  return () => cleanups.forEach((fn) => fn());
}
