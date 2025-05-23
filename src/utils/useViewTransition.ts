import { useCallback } from "react";

export function useViewTransition() {
  return useCallback((fn: () => void) => {
    if ("startViewTransition" in document) {
      (document as any).startViewTransition(() => {
        fn();
      });
    } else {
      fn();
    }
  }, []);
}
