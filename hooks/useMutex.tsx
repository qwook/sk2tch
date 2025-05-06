import { useCallback, useRef } from "react";

export function useMutex() {
  const locking = useRef(false);
  const blockerPromise = useRef(null);
  const blockerResolve = useRef(null);

  const lock = useCallback(() => {
    if (locking.current) return;
    locking.current = true;
    blockerPromise.current = new Promise((resolve, reject) => {
      blockerResolve.current = resolve;
    });
  }, []);

  const unlock = useCallback(() => {
    if (!locking.current) return;
    locking.current = false;
    blockerResolve.current();
  }, []);

  const blocker = useCallback(() => {
    if (locking.current) {
      return blockerPromise.current;
    } else {
      return;
    }
  }, []);

  return [lock, unlock, blocker];
}
