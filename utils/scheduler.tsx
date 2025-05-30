/**
 * scheduler.tsx
 *
 * Drop in replacement for setTimeout and allows for useFrame()
 * outside a THREE.js component.
 */

import customEvents from "./customEvents";
import { RenderCallback, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as Tone from "tone";

// Todo: Figure out a better name for this? Maybe this is just a time library.
// Todo: Pull this out into a context.
let isPaused = false;

type CancelFunction = () => void;

export function sleepPausible(delay) {
  return new Promise((resolve, reject) => {
    setTimeoutPausible(resolve, delay);
  });
}

export function setTimeoutPausible(
  callback: Function,
  timeout: number,
  pausible: boolean = true
): CancelFunction {
  timeout = timeout || 0;
  let lastTime = performance.now();
  let elapsedTime = 0;
  let timeoutId = 0;

  function tick() {
    const now = performance.now();
    if (!isPaused || !pausible) {
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

export function setIntervalPausible(
  callback: Function,
  timeout: number,
  pausible: boolean = true
): CancelFunction {
  let cancel;

  function tick() {
    cancel = setTimeoutPausible(() => {
      callback();
      tick();
    }, timeout, pausible);
  }

  tick();

  return () => {
    cancel();
  };
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

let audioPauseTime = 0;
export function setPaused(paused: boolean) {
  customEvents.emit("pause", paused);
  if (paused) {
    gameTimeHistory =
      gameTimeHistory + (performance.now() - gameTimeSinceUnpaused);
    audioPauseTime = Tone.now();
    Tone.getTransport().pause(audioPauseTime);
    console.log(audioPauseTime);
    console.log("pause");
  } else {
    gameTimeSinceUnpaused = performance.now();
    // Tone.getTransport().start(audioPauseTime);
    Tone.getTransport().start();
  }
  isPaused = paused;
}
setPaused(isPaused);

export function useFramePausibleCanvaslessAsync(
  callback: (delta: number) => Promise<void>
) {
  useEffect(() => {
    let cancelledEarly = false;
    let animationFrame;
    let lastTime = performance.now();
    const frame = async () => {
      const time = performance.now();
      const deltaTime = time - lastTime;
      lastTime = time;
      if (cancelledEarly) return;
      if (!isPaused) {
        await callback(deltaTime / 1000);
      }
      if (cancelledEarly) return;
      animationFrame = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      cancelledEarly = true;
      cancelAnimationFrame(animationFrame);
    };
  }, [callback]);
}

export function useFramePausibleCanvasless(callback: (delta: number) => void) {
  useEffect(() => {
    let animationFrame;
    let lastTime = performance.now();
    const frame = () => {
      const time = performance.now();
      const deltaTime = time - lastTime;
      lastTime = time;
      if (!isPaused) {
        callback(deltaTime / 1000);
      }
      animationFrame = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [callback]);
}

export function useFrameCanvasless(callback: (delta: number) => void) {
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
