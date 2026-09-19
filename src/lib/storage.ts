/** localStorage wrappers that never throw — private mode and blocked storage are fine. */

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    // Merge so settings added in a later release still get their defaults.
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && typeof fallback === "object") {
      return { ...(fallback as object), ...(parsed as object) } as T;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or blocked storage — state still lives in memory for this session */
  }
}

export const KEYS = {
  settings: "cn:settings",
  favorites: "cn:favorites",
} as const;
