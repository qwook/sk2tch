import { Timeline2 } from "./Timeline2";

describe("timeline", () => {
  test("simple timeline", async () => {
    const timelineEvents = [];

    const timeline = new Timeline2();
    timeline.timeline = [
      {
        duration: 1000,
        onStart() {
          timelineEvents.push("frame 1 start");
        },
        onEnd() {
          timelineEvents.push("frame 1 end");
        },
        onFrame(deltaTime, progress) {
          timelineEvents.push(["frame", deltaTime, progress]);
        },
      },
    ];
    timeline.play();
    timeline.process(500);
    expect(timeline.isPlaying()).toBeTruthy();

    expect(timelineEvents).toStrictEqual([
      "frame 1 start",
      ["frame", 500, 0.5],
    ]);

    timeline.process(500);

    expect(timelineEvents).toStrictEqual([
      "frame 1 start",
      ["frame", 500, 0.5],
      ["frame", 500, 1.0],
      "frame 1 end",
    ]);

    expect(timeline.isPlaying()).toBeFalsy();
  });

  test("timeline skip", async () => {
    const timelineEvents = [];

    const timeline = new Timeline2();
    timeline.timeline = [
      {
        duration: 500,
        onStart() {
          timelineEvents.push("frame 1 start");
        },
        onEnd() {
          timelineEvents.push("frame 1 end");
        },
        onFrame(deltaTime, progress) {
          timelineEvents.push(["frame 1", deltaTime, progress]);
        },
      },
      {
        duration: 500,
        onStart() {
          timelineEvents.push("frame 2 start");
        },
        onEnd() {
          timelineEvents.push("frame 2 end");
        },
        onFrame(deltaTime, progress) {
          timelineEvents.push(["frame 2", deltaTime, progress]);
        },
      },
    ];
    timeline.play();
    timeline.process(1001);

    expect(timeline.isPlaying()).toBeFalsy();
    expect(timelineEvents).toStrictEqual([
      "frame 1 start",
      ["frame 1", 500, 1.0],
      "frame 1 end",
      "frame 2 start",
      ["frame 2", 500, 1.0],
      "frame 2 end",
    ]);
  });

  test("timeline skip in middle", async () => {
    const timelineEvents = [];

    const timeline = new Timeline2();
    timeline.timeline = [
      {
        duration: 500,
        onStart() {
          timelineEvents.push("frame 1 start");
        },
        onEnd() {
          timelineEvents.push("frame 1 end");
        },
        onFrame(deltaTime, progress) {
          timelineEvents.push(["frame 1", deltaTime, progress]);
        },
      },
      {
        duration: 500,
        onStart() {
          timelineEvents.push("frame 2 start");
        },
        onEnd() {
          timelineEvents.push("frame 2 end");
        },
        onFrame(deltaTime, progress) {
          timelineEvents.push(["frame 2", deltaTime, progress]);
        },
      },
    ];
    timeline.play();
    timeline.process(900);

    expect(timeline.isPlaying()).toBeTruthy();
    expect(timelineEvents).toStrictEqual([
      "frame 1 start",
      ["frame 1", 500, 1.0],
      "frame 1 end",
      "frame 2 start",
      ["frame 2", 400, 0.8],
    ]);

    timeline.process(900);

    expect(timeline.isPlaying()).toBeFalsy();
    expect(timelineEvents).toStrictEqual([
      "frame 1 start",
      ["frame 1", 500, 1.0],
      "frame 1 end",
      "frame 2 start",
      ["frame 2", 400, 0.8],
      ["frame 2", 100, 1],
      "frame 2 end",
    ]);
  });

  test("zero duration", async () => {
    const timelineEvents = [];

    const timeline = new Timeline2();
    timeline.timeline = [
      {
        duration: 0,
        onStart() {
          timelineEvents.push("frame 1 start");
        },
        onEnd() {
          timelineEvents.push("frame 1 end");
        },
        onFrame(deltaTime, progress) {
          timelineEvents.push(["frame 1", deltaTime, progress]);
        },
      },
      {
        duration: 0,
        onStart() {
          timelineEvents.push("frame 2 start");
        },
        onEnd() {
          timelineEvents.push("frame 2 end");
        },
        onFrame(deltaTime, progress) {
          timelineEvents.push(["frame 2", deltaTime, progress]);
        },
      },
    ];
    timeline.play();
    timeline.process(100);

    expect(timeline.isPlaying()).toBeFalsy();
    expect(timelineEvents).toStrictEqual([
      "frame 1 start",
      ["frame 1", 0, 1.0],
      "frame 1 end",
      "frame 2 start",
      ["frame 2", 0, 1.0],
      "frame 2 end",
    ]);
  });
});
