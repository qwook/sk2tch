import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { ConVarContext } from "../convars/ConVarContext";
import "./CheatsMenu.scss";
import { useRef } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";

function CheatInput({ name }) {
  const { conVarStore } = useContext(ConVarContext);
  const [sync, setConVar, conVar] = useStore(
    conVarStore,
    useShallow((state) => [
      state.conVarMap[name]?.sync,
      state.setConVar,
      state.conVarMap[name]?.value,
    ])
  );

  const textInput = useRef(null);

  useEffect(() => {
    if (sync) {
      console.log(sync);
      const poll = setInterval(() => {
        if (document.activeElement === textInput.current) {
          return;
        }
        textInput.current.value = JSON.stringify(sync.getter());
      }, 10);
      return () => {
        clearInterval(poll);
      };
    }
  }, [sync]);

  useEffect(() => {
    console.log("yo");
    console.log(conVar);
    if (document.activeElement === textInput.current) {
      return;
    }
    if (sync) {
      return;
    }
    textInput.current.value = JSON.stringify(conVar);
  }, [conVar, sync]);

  return (
    <input
      type="text"
      ref={textInput}
      onKeyDown={(e) => {
        if ((e.code as KeyCode) === "Enter") {
          try {
            if (sync) {
              sync.setter(JSON.parse(textInput.current.value));
            } else {
              setConVar(name, JSON.parse(textInput.current.value));
            }
          } catch (e) {
            console.log(e);
          }
        }
        if (document.activeElement === textInput.current) {
          e.stopPropagation();
        }
      }}
    />
  );
}

function PersistInput({ name, disabled }) {
  const { conVarStore } = useContext(ConVarContext);
  const [persistValue, setPersistValue] = useStore(
    conVarStore,
    useShallow((state) => [
      state.persistMap[name]?.value,
      state.setPersistValue,
    ])
  );

  const textInput = useRef(null);

  useEffect(() => {
    if (document.activeElement === textInput.current) {
      return;
    }
    textInput.current.value = JSON.stringify(persistValue);
  }, [persistValue]);

  return (
    <input
      type="text"
      ref={textInput}
      disabled={disabled}
      onKeyDown={(e) => {
        if ((e.code as KeyCode) === "Enter") {
          try {
            setPersistValue(name, JSON.parse(textInput.current.value));
          } catch (e) {
            console.log(e);
          }
        }
        if (document.activeElement === textInput.current) {
          e.stopPropagation();
        }
      }}
    />
  );
}

export function CheatsMenu() {
  const [show, setShow] = useState(false);

  const { conVarStore } = useContext(ConVarContext);
  const [conVarMap, persistMap, setPersistEnabled] = useStore(
    conVarStore,
    useShallow((state) => [
      state.conVarMap,
      state.persistMap,
      state.setPersistEnabled,
    ])
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Tilde
      if ((event.code as KeyCode) === "Backquote") {
        setShow((show) => !show);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div
      className="cheats-menu"
      style={{
        fontFamily: "Courier New",
        display: show ? "block" : "none",
        background: "rgba(0, 0, 0, 0.5)",
        color: "white",
        position: "absolute",
        top: 0,
        left: 0,
        overflow: "scroll",
        width: "100%",
        height: "100%",
        cursor: "default",
        // Yeah... Todo: Create a zIndex organizer...
        zIndex: 100000000,
      }}
    >
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
            <th>Persist</th>
            <th>Persist Value</th>
          </tr>
        </thead>
        <tbody>
          {show &&
            Object.keys(conVarMap).map((key) => (
              <tr key={key}>
                <td>{key}</td>
                <td>
                  <CheatInput name={key} />
                </td>
                <td>
                  <input
                    type="checkbox"
                    defaultChecked={persistMap[key]?.enabled}
                    checked={persistMap[key]?.enabled}
                    onChange={(e) => {
                      setPersistEnabled(key, !persistMap[key]?.enabled);
                    }}
                  />
                </td>
                <td>
                  <PersistInput
                    name={key}
                    disabled={!persistMap[key]?.enabled}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
