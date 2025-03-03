# DRAFT: Sounds

Sounds and Music should belong to the same system, but there are some obvious
differences.

## Sounds

Sounds can be replayed and layered ontop of each other.

## Music

Music can be looped and ideally cannot be played ontop of each other.

## FX

Allow for sound buses and FX of sounds.

## Implementation Sketches

### Sketch 1

```jsx
() => (
  <SoundProvider>
    <SoundBus name="sound">
      <Sound name="gun" volume="0.1" resource={require("./gun.mp3")} />
    </SoundBus>
    <SoundBus name="music">
      <Sound
        name="soundtrack1"
        volume="0.1"
        resource={require("./soundtrack1.mp3")}
        loop
      />
    </SoundBus>
  </SoundProvider>
);
```

```jsx
const { sound } = useSound();
sound.play("gun");

// If transition is defined, it fades all other tracks.
sound.play("soundtrack1", { transition: "cut" });
```

I will probably be using Tone.js, as it's the highest maintained repository for
sounds. It also does a lot of low-level things.

I am a bit too scared to transition LSO over to Tone.js, but I'll bite.

### Sketch 2

```jsx
() => (
  <SoundProvider>
    <SoundBus name="sound">
      <SoundVolume>
        <Sound name="gun" pool={10} volume="0.1" resource={require("./gun.mp3")} />
      </SoundVolume>
    </SoundBus>
    <SoundBus name="music">
      <Sound
        name="soundtrack1"
        volume="0.1"
        resource={require("./soundtrack1.mp3")}
        loop
      />
    </SoundBus>
  </SoundProvider>
);


Somewhere else..
() => {
  const { playSound, getBus } = useSound();

}
```

## Sketch 3

```jsx
<SoundProvider>
  <SoundPanVol name="music">
    <SoundSamplerCatch>
      <Sound
        name="soundtrack1"
        volume="0.1"
        resource={require("./soundtrack1.mp3")}
        loop
      />
      <Sound
        name="soundtrack2"
        volume="0.1"
        resource={require("./soundtrack2.mp3")}
        loop
      />
    </SoundSamplerCatch>
  </SoundPanVol>
  <SoundPanVol name="sfx">
    <Sound
      name="shoot"
      volume="0.1"
      resource={require("./shoot.mp3")}
      loop
    />
    <Sound
      name="walk"
      volume="0.1"
      resource={require("./walk.mp3")}
      loop
    />
</SoundProvider>
```
