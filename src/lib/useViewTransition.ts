import { useCallback } from "react";

/** Wraps a state change in a view transition where the browser supports one. */
export function useViewTransition() {
  return useCallback((fn: () => void) => {
    if ("startViewTransition" in document) {
      (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(
        fn,
      );
    } else {
      fn();
    }
  }, []);
}
