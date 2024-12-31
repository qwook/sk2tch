/**
 * scheduler.tsx
 *
 * Drop in replacement for setTimeout and allows for useFrame()
 * outside a THREE.js component.
 */

import customEvents from "./customEvents";
import { RenderCallback, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";

// Todo: Figure out a better name for this? Maybe this is just a time library.
// Todo: Pull this out into a context.
let isPaused = false;

type TimeoutCallbackFunction = () => void;
type CancelFunction = () => void;

export function setTimeoutPausible(
  callback: TimeoutCallbackFunction,
  timeout: number
): CancelFunction {
  timeout = timeout || 0;
  let lastTime = performance.now();
  let elapsedTime = 0;
  let timeoutId = 0;

  function tick() {
    const now = performance.now();
    if (!isPaused) {
      elapsedTime += now - lastTime;
    }
    lastTime = now;
    if (elapsedTime >= timeout) {
      callback();
    } else {
      timeoutId = requestAnimationFrame(tick);
    }
  }

  timeoutId = requestAnimationFrame(tick);

  function cancel() {
    cancelAnimationFrame(timeoutId);
  }

  return cancel;
}

export function clearTimeoutPausible(cancel: CancelFunction) {
  cancel();
}

let gameTimeHistory = 0;
let gameTimeSinceUnpaused = performance.now();
export function pausibleNow() {
  if (isPaused) {
    return gameTimeHistory;
  } else {
    return gameTimeHistory + (performance.now() - gameTimeSinceUnpaused);
  }
}

export function setPaused(paused: boolean) {
  customEvents.emit("pause", paused);
  if (paused) {
    gameTimeHistory =
      gameTimeHistory + (performance.now() - gameTimeSinceUnpaused);
  } else {
    gameTimeSinceUnpaused = performance.now();
  }
  isPaused = paused;
}

export function useFramePausibleCanvasless(
  callback: (delta: number) => null,
) {
  useEffect(() => {
    let animationFrame;
    let lastTime = performance.now();
    const frame = () => {
      const time = performance.now();
      const deltaTime = time - lastTime;
      lastTime = time;
      callback(deltaTime);
      animationFrame = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [callback]);
}

export function useFramePausible(
  callback: RenderCallback,
  renderPriority?: number
) {
  let i = useRef(0);
  let realDelta = useRef(0);
  useFrame((state, delta) => {
    i.current++;
    realDelta.current += delta;
    if (i.current % 1 !== 0) {
      return;
    }
    if (isPaused) {
      return;
    }
    callback(state, realDelta.current);
    realDelta.current = 0;
  }, renderPriority);
}
