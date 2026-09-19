/**
 * Sound + desktop notifications for pumping coins.
 *
 * Browsers only let audio play after a user gesture, so the toggle in the header
 * primes the element with a muted play() and everything after that is allowed.
 */

let audio: HTMLAudioElement | null = null;

function element(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio("/notification.mp3");
    audio.preload = "auto";
  }
  return audio;
}

/** Call from a click handler. Resolves false if the browser refused. */
export async function primeAudio(): Promise<boolean> {
  const el = element();
  try {
    el.muted = true;
    await el.play();
    el.pause();
    el.currentTime = 0;
    el.muted = false;
    return true;
  } catch {
    el.muted = false;
    return false;
  }
}

export function playAlert(): void {
  const el = element();
  try {
    el.currentTime = 0;
    void el.play();
  } catch {
    /* ignore — autoplay policy or a missing codec */
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  return (await Notification.requestPermission()) === "granted";
}

export function notify(symbols: string[], percent: number): void {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const [first, ...rest] = symbols;
  const title = rest.length ? `${first} +${rest.length} pumping` : `${first} is pumping`;
  try {
    new Notification(title, {
      body: `${symbols.slice(0, 8).join(", ")} moved past ${percent}%`,
      icon: "/logo192.png",
      // One rolling notification instead of a stack of them.
      tag: "crypto-notifier",
      silent: true,
    });
  } catch {
    /* some browsers require a service worker for notifications */
  }
}
