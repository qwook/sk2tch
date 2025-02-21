import { useEffect } from "react";
import { STANDALONE_APP } from "../utils/defines";
import { useState } from "react";
import { setPaused } from "../utils/scheduler";
import { createContext } from "react";
import { useContext } from "react";

if (STANDALONE_APP) {
  if (navigator && navigator.keyboard && navigator.keyboard.lock) {
    navigator.keyboard.lock(["Escape"]);
  }
}

const EscapeMenuContext = createContext<{
  escapeMenuVisible?: boolean;
  setEscapeMenuVisible?: (boolean) => void;
}>({});

export function useEscapeMenu() {
  return useContext(EscapeMenuContext);
}

export function EscapeMenu({ menu }) {
  const [escapeMenuVisible, setEscapeMenuVisible] = useState(false);

  useEffect(() => {
    // Add listener to "ESC" key, then remove listener when this component unmounts.
    const keyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEscapeMenuVisible((visible) => !visible);
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", keyDown);
    return () => {
      document.removeEventListener("keydown", keyDown);
    };
  });

  useEffect(() => {
    setPaused(escapeMenuVisible);
  }, [escapeMenuVisible]);

  return (
    <EscapeMenuContext.Provider
      value={{ escapeMenuVisible, setEscapeMenuVisible }}
    >
      {escapeMenuVisible && menu()}
    </EscapeMenuContext.Provider>
  );
}
