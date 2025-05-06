import { useMemo } from "react";
import { createContext } from "react";
import { useContext } from "react";
import { useState } from "react";
import { useCallback } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import * as Tone from "tone";
import { unmute } from "./unmute";

const SoundContext = createContext(null);
const SoundBusContext = createContext(null);
const SoundSampleCatchContext = createContext([]);

unmute(Tone.getContext().rawContext, true, false);

global.toneStarted = false;
document.body.addEventListener("click", async () => {
  if (global.toneStarted) return;
  global.toneStarted = true;
  await Tone.start();
});

export function SoundProvider({ children }) {
  const sounds = useRef({});

  const addSound = useCallback(
    (name, sound) => {
      if (sounds.current[name]) {
        throw new Error("Sound name needs to be unique.");
      }
      sounds.current[name] = sound;
    },
    [sounds]
  );

  const removeSound = useCallback(
    (name) => {
      sounds.current[name] = null;
      delete sounds.current[name];
    },
    [sounds]
  );

  const playSound = useCallback(
    (name) => {
      if (!sounds.current[name]) {
        throw new Error("Trying to play a non-existent sound.");
      }
      if (sounds.current[name].loaded) {
        sounds.current[name].start();
      } else {
        sounds.current[name].autostart = true;
      }
    },
    [sounds]
  );

  /**
   * Helper function to easily stop all sounds and just play this sound (isolated by catches).
   */
  const playMusic = useCallback((name) => {
    const sound = getSound(name);
    if (sound) {
      const soundCatch = (sound as unknown as { catch: Tone.Player[] }).catch;
      if (soundCatch) {
        for (const childSound of soundCatch) {
          if (childSound !== sound) {
            childSound.stop();
          }
        }
      }
    }
    playSound(name);
  }, []);

  const getSound = useCallback<(name: string) => Tone.Player | []>(
    (name) => {
      return sounds.current[name] as Tone.Sampler;
    },
    [sounds]
  );

  return (
    <SoundBusContext.Provider value={Tone.getDestination()}>
      <SoundContext.Provider
        value={{ addSound, removeSound, playSound, getSound, playMusic }}
      >
        {children}
      </SoundContext.Provider>
    </SoundBusContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}

function ToneToReactFactory(ToneClass) {
  return function ToneComponent({
    src,
    name,
    args = [],
    children,
  }: {
    src: any;
    name?: any;
    args: any[];
    children: React.ReactNode;
  }) {
    const { addSound, removeSound } = useContext(SoundContext);
    const destination = useContext(SoundBusContext);

    const [source, setSource] = useState(null);

    useEffect(() => {
      const player = new ToneClass(...args);
      setSource(player);

      const nameCached = name;
      if (nameCached) addSound(nameCached, player);
      return () => {
        player.dispose();
        setSource(null);

        if (nameCached) removeSound(nameCached);
      };
    }, [src]);

    useEffect(() => {
      if (source && destination) {
        source.connect(destination);
      }
      return () => {
        if (source) {
          source.disconnect();
        }
      };
    }, [source, destination]);

    return (
      <SoundBusContext.Provider value={source}>
        {children}
      </SoundBusContext.Provider>
    );
  };
}

export const SoundPanVol = ToneToReactFactory(Tone.PanVol);

export function SoundSample({
  src,
  name,
  children,
  playbackRate = 1,
  pool = 1, // How many of these sounds are allowed to play at one time.
  retrigger,
  loop,
}: {
  src: any;
  name?: any;
  children: React.ReactNode;
  playbackRate: number;
  pool: number;
  retrigger: any;
  loop: any;
}) {
  const { addSound, removeSound } = useContext(SoundContext);
  const destination = useContext(SoundBusContext);
  const soundSampleCatch = useContext(SoundSampleCatchContext);

  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (!player) return;
    if (soundSampleCatch.indexOf(player) === -1) {
      soundSampleCatch.push(player);
      player.catch = soundSampleCatch;
    }
    return () => {
      const index = soundSampleCatch.indexOf(player);
      if (index !== -1) {
        soundSampleCatch.splice(index, 1);
      }
      player.catch = soundSampleCatch;
    };
  }, [player, soundSampleCatch]);

  useEffect(() => {
    const player = new Tone.Player(src);
    player.sync();
    setPlayer(player);

    const nameCached = name;
    if (nameCached) addSound(nameCached, player);
    return () => {
      player.dispose();
      setPlayer(null);

      if (nameCached) removeSound(nameCached, player);
    };
  }, [src]);

  useEffect(() => {
    if (player && destination) {
      player.connect(destination);
    }
    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [player, destination]);

  useEffect(() => {
    if (!player) {
      return;
    }
    player.retrigger = retrigger;
    player.loop = loop;
    player.playbackRate = playbackRate;
  }, [player, retrigger, loop]);

  return <>{children}</>;
}

/**
 * SoundSampleCatch lets you grab all the sound samples underneath.
 * @param
 * @returns
 */
export function SoundSampleCatch({ name, children }) {
  const { addSound, removeSound } = useContext(SoundContext);
  const soundCatch = useMemo(() => [], []);

  useEffect(() => {
    const nameCached = name;
    if (nameCached) addSound(nameCached, soundCatch);
    return () => {
      if (nameCached) removeSound(nameCached, soundCatch);
    };
  }, []);

  return (
    <SoundSampleCatchContext.Provider value={soundCatch}>
      {children}
    </SoundSampleCatchContext.Provider>
  );
}
