interface TimelineKeyframe {
  duration: number;
  onFrame?: (deltaTime: number, progress: number) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export type Timeline = TimelineKeyframe[];

export class Timeline2 {
  timeline: Timeline = [];
  canRetrigger: boolean = false;
  onStart = () => {};
  onStop = () => {};

  private frame = 0;
  private frameTimeElapsedMs = 0;
  private playing = false;

  constructor() {
    console.log("new timeline")
  }
  isPlaying() {
    return this.playing;
  }
  play() {
    console.log("play");
    if (this.playing && !this.canRetrigger) {
      return;
    }
    this.playing = true;
    this.frame = 0;
    this.frameTimeElapsedMs = 0;
    if (this.timeline[0]) {
      this.timeline[0].onStart && this.timeline[0].onStart();
    }
    this.onStart && this.onStart();
  }
  stop() {
    this.playing = false;
    this.onStop && this.onStop();
  }
  process(frameTimeMs: number) {
    if (!this.playing) return;
    while (frameTimeMs > 0 && this.frame < this.timeline.length) {
      const currentFrame = this.timeline[this.frame];

      // Calculate frame deltaTime and progress.
      // We use Math.min to confine these values within the frame.
      // Any extra "seconds" that pass on will be used to process the next frame.
      const deltaTime =
        Math.min(this.frameTimeElapsedMs + frameTimeMs, currentFrame.duration) -
        this.frameTimeElapsedMs;
      const progress = Math.min(
        (this.frameTimeElapsedMs + frameTimeMs) / currentFrame.duration,
        1
      );

      currentFrame.onFrame && currentFrame.onFrame(deltaTime, progress);

      // Actually progress frameTimeElapsedMs
      this.frameTimeElapsedMs += frameTimeMs;
      if (this.frameTimeElapsedMs >= currentFrame.duration) {
        this.timeline[this.frame]?.onEnd && this.timeline[this.frame]?.onEnd();
        // We've passed this frame, let's pass the remaining seconds to the next frame.
        frameTimeMs = this.frameTimeElapsedMs - currentFrame.duration;
        this.frameTimeElapsedMs = 0;
        this.frame++;
        this.timeline[this.frame]?.onStart &&
          this.timeline[this.frame]?.onStart();
      } else {
        frameTimeMs = 0;
      }
    }
    // End of the timeline!
    if (this.frame >= this.timeline.length) {
      this.stop();
    }
  }
}
