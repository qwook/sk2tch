import { useCallback, useMemo, useState } from "react";
import { useFramePausibleCanvasless } from "../../utils/scheduler";
import { Timeline, Timeline2 } from "./Timeline2";

type TimelineOptions = {
  deps: [];
  canRetrigger: boolean;
  onStart?: () => void;
  onStop?: () => void;
};

export function useTimeline2(
  timelineCb: () => Timeline,
  options: TimelineOptions = { deps: [], canRetrigger: false }
) {
  // Using useState so it doesn't create a new timeline all the time.
  const [timeline, _] = useState(() => new Timeline2());
  const timelineDefinition = useMemo(timelineCb, options.deps);

  timeline.timeline = timelineDefinition;
  timeline.onStart = options.onStart;
  timeline.onStop = options.onStop;
  timeline.canRetrigger = options.canRetrigger;

  useFramePausibleCanvasless((deltaTime) => {
    timeline.process(deltaTime);
  });

  return {
    play: useCallback(() => timeline.play(), [timeline]),
    stop: useCallback(() => timeline.stop(), [timeline]),
  };
}

/**
 * Just like useTimeline2 but listens to the play state.
 * @param timelineCb
 * @param options
 * @returns
 */
export function useTimeline2WithPlayState(
  timelineCb: () => Timeline,
  options?: TimelineOptions
) {
  const [playing, setPlaying] = useState(false);

  const timelineOutput = useTimeline2(timelineCb, {
    ...options,
    onStart() {
      setPlaying(true);
      options?.onStart && options?.onStart();
    },
    onStop() {
      setPlaying(false);
      options?.onStop && options?.onStop();
    },
  });

  return { ...timelineOutput, playing };
}
