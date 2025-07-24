# Timeline Version 2

Timeline is a programmatic animator written for react.

```jsx
const {play, stop, pause, isPlaying} = useTimeline2(() => [{
  duration: 1 // In seconds
  onStart: () => {}
  onEnd: () => {}
  onFrame: (deltaTime, progress) => {}
}], {
  onRetrigger: () => {},
  onStart: () => {},
  onStop: () => {},
  canRetrigger,
  deps: []
})
```

## Test Cases

- Slow time ticking, normal.
- Time ticking skips all frames.
