import { useContext } from "react";
import { ConVarContext } from "./ConVarContext";
import { useEffect } from "react";
import { useCallback } from "react";
import { useStore, create } from "zustand";
import { createStore } from "zustand/vanilla";
import { useShallow } from "zustand/react/shallow";
import { produce } from "immer";

/*

Notes: Fuck. Okay, because this is like a composite state...
aka everything is stored in a single "dispatch" or state...
this is going to cause a re-render to EVERYTHING.

Update: Spent a whole day refactoring this bullsh!

Now using stores! Which I probably should have been doing from the start.
Will be using stores from now on.

*/

export function useCheatConsumer(name) {
  const { conVarStore } = useContext(ConVarContext);
  const setConVar = useStore(conVarStore, (state) => state.setConVar);
  const conVar = useStore(
    conVarStore,
    useShallow((state) => state.conVarMap[name]?.value)
  );

  return [
    conVar,
    useCallback((newState) => {
      setConVar(name, newState);
    }, []),
  ];
}

export function useCheatState(name, defaultState) {
  const { conVarStore } = useContext(ConVarContext);
  const [
    loadedPersist,
    setLoadedPersist,
    persistEnabled,
    persistValue,
    setConVar,
    clearSync,
  ] = useStore(
    conVarStore,
    useShallow((state) => [
      state.loadedPersist,
      state.setLoadedPersist,
      state.persistMap && state.persistMap[name]?.enabled,
      state.persistMap && state.persistMap[name]?.value,
      state.setConVar,
      state.clearSync,
    ])
  );

  if (!loadedPersist[name]) {
    setLoadedPersist(name);
    setConVar(name, persistEnabled ? persistValue : defaultState);
  }

  useEffect(() => {
    clearSync();
  }, []);

  return useCheatConsumer(name);
}

/**
 * useCheatSync
 *
 * Provide a getter and setter function. Registers a cheat that exists not as a react state.
 */
export function useCheatSync(name, getter, setter) {
  const { conVarStore } = useContext(ConVarContext);

  const getterCb = useCallback(getter, []);
  const setterCb = useCallback(setter, []);

  const [setSync, clearSync] = useStore(
    conVarStore,
    useShallow((state) => [state.setSync, state.clearSync])
  );

  useEffect(() => {
    setSync(name, getterCb, setterCb);
    return () => {
      clearSync(name);
    };
  }, [name, getterCb, setterCb]);
}

/**
 * It's a convar that is both consistent throughout reloads and changes.
 *
 * @param name
 * @param defaultValue
 */
export function useSettingsState(name, defaultValue) {
  const { conVarStore } = useContext(ConVarContext);

  const [setPersistEnabled, setPersistValue] = useStore(
    conVarStore,
    useShallow((state) => [state.setPersistEnabled, state.setPersistValue])
  );

  const [setting, setSetting] = useCheatState(name, defaultValue);

  useEffect(() => {
    setPersistEnabled(name, true);
  }, []);

  useEffect(() => {
    setPersistValue(name, setting);
  }, [setting]);

  return [setting, setSetting];
}

export const useSettingsConsumer = useCheatConsumer;
