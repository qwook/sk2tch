/**
 * timeline.tsx
 *
 * Allows for simple linear keyframe programmatic animations.
 *
 * In process of being Deprecated for Timeline2.
 */

import { useEffect, useMemo, useRef, useState } from "react";

import { useFramePausible, useFramePausibleCanvasless } from "./scheduler";

interface TimelineKeyframe {
  duration: number;
  frameCallback?: (deltaTime: number, progress: number) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

type Timeline = TimelineKeyframe[];

interface TimelineAnimationOptions {
  norestart; // If the play function was spammed, don't allow for restarting.
}

/**
 * A hook for defining an animation.
 *
 * @param timeline An array of keyframes or a function to create the keyframes.
 * @param options
 * @returns [ playAnimation(), isPlaying ]
 */
export default function useTimelineAnimation(
  timeline: Timeline | (() => Timeline),
  options: TimelineAnimationOptions
): [() => void, boolean] {
  const playingRef = useRef(false);
  const optionsRef = useRef(options);
  const [playing, setPlaying] = useState(false);
  const progressTime = useRef(0);

  optionsRef.current = options;

  // Let's preprocess the timeline first to get the start time of each timeline object.
  const processedTimeline = useMemo(() => {
    let currentTime = 0;
    return (typeof timeline === "function" ? timeline() : timeline).map(
      (timelineObj) => {
        const startTime = currentTime;
        currentTime += timelineObj.duration;
        return {
          ...timelineObj,
          startTime,
        };
      }
    );
  }, [timeline]);

  useFramePausibleCanvasless((delta) => {
    if (playing === false) {
      return;
    }

    // We need to keep track of the start and end timestamps.
    const startFrameTime = progressTime.current;
    const endFrameTime = progressTime.current + delta;
    progressTime.current = endFrameTime;

    let hitFrame = false;

    // Then we should try to find what frames in the timeline are between the start and end time.
    processedTimeline.forEach((timelineObj, idx) => {
      // If the starting edge of the timeline object is inbetween our range, call onStart.
      if (
        timelineObj.startTime >= startFrameTime &&
        timelineObj.startTime < endFrameTime
      ) {
        if (timelineObj.onStart) {
          timelineObj.onStart();
        }
        hitFrame = true;
      }
      // If the starting and end times are at all inbetween our range, or if we are directly inside of an object, then call frameCallback.
      if (
        (timelineObj.startTime >= startFrameTime &&
          timelineObj.startTime <= endFrameTime) ||
        (timelineObj.startTime < startFrameTime &&
          timelineObj.startTime + timelineObj.duration > endFrameTime) ||
        (timelineObj.startTime < startFrameTime &&
          timelineObj.startTime + timelineObj.duration > startFrameTime)
      ) {
        if (timelineObj.frameCallback) {
          timelineObj.frameCallback(
            delta,
            Math.min(
              (progressTime.current - timelineObj.startTime) /
                timelineObj.duration,
              1
            )
          );
        }
        hitFrame = true;
      }
      // If the ending edge of the timeline object is inbetween our range, call onEnd.
      if (
        timelineObj.startTime + timelineObj.duration >= startFrameTime &&
        timelineObj.startTime + timelineObj.duration < endFrameTime
      ) {
        if (timelineObj.onEnd) {
          timelineObj.onEnd();
        }
        hitFrame = true;
      }
    });

    if (!hitFrame) {
      setPlaying(false);
      playingRef.current = false;
    }
  });

  useEffect(() => {
    return () => {
      if (playingRef.current && optionsRef.current?.onEarlyCleanup) {
        optionsRef.current?.onEarlyCleanup();
      }
    };
  }, []);

  return [
    () => {
      if (playing && options?.norestart) {
        return;
      }
      if (playing && options?.onRestart) {
        options?.onRestart();
      }
      setPlaying(true);
      playingRef.current = true;
      progressTime.current = 0;
    },
    playing,
  ];
}
