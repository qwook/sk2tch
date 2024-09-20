import { MutableRefObject, useRef } from "react";

/**
 * useRef doesn't normally take in a function the way useState does.
 * This can lead to initializing an object multiple times.
 *
 * @param {*} initializerFn
 * @returns The ref.
 */
export default function useRefWithInitializer<T>(
  initializerFn: () => T
): MutableRefObject<T> {
  const ref = useRef(null);
  if (ref.current === null) {
    ref.current = initializerFn();
  }
  return ref;
}
