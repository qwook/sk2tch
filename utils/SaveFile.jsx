import { createContext, useEffect, useState } from "react";

// TODO: Decouple cheat system.
import { IGNORE_SAVE } from "../../games/horror/src/sv_cheats";

let saveState =
  typeof window !== "undefined" && window.electronAPI
    ? JSON.parse(window.electronAPI.loadKey("save")) || {}
    : (typeof localStorage !== "undefined"
        ? JSON.parse(localStorage.getItem("save"))
        : null) || {};

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
  if (IGNORE_SAVE) {
    saveState[name] = initialState;
  }
  const [state, setState] = useState(
    saveState[name] !== undefined
      ? postProcessLoad(saveState[name])
      : initialState
  );
  useEffect(() => {
    saveState[name] = postProcessSave(state);
    if (!IGNORE_SAVE) {
      save();
    }
  }, [name, state, postProcessSave]);
  return [state, setState];
}

export function resetSave() {
  saveState = {};
  window.electronAPI
    ? window.electronAPI?.saveKey("save", JSON.stringify(saveState))
    : localStorage.setItem("save", JSON.stringify(saveState));
  // Reload page
  window.location.reload();
}

export function save() {
  window.electronAPI
    ? window.electronAPI?.saveKey("save", JSON.stringify(saveState))
    : localStorage.setItem("save", JSON.stringify(saveState));
}

export const SaveContext = createContext();
