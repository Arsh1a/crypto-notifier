export function playSound(audioRef: React.RefObject<HTMLAudioElement | null>): void {
  // Autoplay policy rejects this until the page has had a click; the navbar
  // toggle is that click, so later calls are allowed.
  void audioRef.current?.play().catch(() => {});
}
