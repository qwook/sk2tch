import { createContext, useEffect, useState } from "react";
import cheats from "../features/cheats/cheats";

// Common load storage function.
export function loadStorage(keyName) {
  try {
    return typeof window !== "undefined" && window.electronAPI
      ? JSON.parse(window.electronAPI.loadKey(keyName)) || {}
      : (typeof localStorage !== "undefined"
          ? JSON.parse(localStorage.getItem(keyName))
          : null) || {};
  } catch (e) {
    console.log(e);
    return {};
  }
}

// Common save storage function.
export function saveStorage(keyName, value) {
  window.electronAPI
    ? window.electronAPI?.saveKey(keyName, JSON.stringify(value))
    : localStorage.setItem(keyName, JSON.stringify(value));
}

let saveState = loadStorage("save");

/**
 *
 * @param {*} name
 * @param {*} initialState
 * @param {*} postProcessLoad Optional, helps with deserializing objects.
 * @param {*} postProcessSave Optional, helps with serializing objects.
 * @returns
 */
export function useSaveState(
  name,
  initialState,
  postProcessLoad = (data) => data,
  postProcessSave = (data) => data
) {
  if (cheats.IGNORE_SAVE) {
    saveState[name] = initialState;
  }
  const [state, setState] = useState(
    saveState[name] !== undefined
      ? postProcessLoad(saveState[name])
      : initialState
  );
  useEffect(() => {
    saveState[name] = postProcessSave(state);
    if (!cheats.IGNORE_SAVE) {
      save();
    }
  }, [name, state, postProcessSave]);
  return [state, setState];
}

export function resetSave() {
  saveState = {};
  saveStorage("save", saveState);
  // Reload page
  window.location.reload();
}

export function save() {
  saveStorage("save", saveState);
}

export const SaveContext = createContext();
