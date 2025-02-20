import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { ConVarContext } from "../convars/ConVarContext";
import "./CheatsMenu.scss";
import { useRef } from "react";

function CheatInput({ name }) {
  const { conVarMap: cheatsMap, conVarDispatch: cheatsDispatch, conVarMetaMap: cheatsMetaMap, conVarMetaDispatch: cheatsMetaDispatch } =
    useContext(ConVarContext);
  const textInput = useRef(null);

  useEffect(() => {
    if (cheatsMetaMap[name].sync) {
      const poll = setInterval(() => {
        if (document.activeElement === textInput.current) {
          return;
        }
        textInput.current.value = JSON.stringify(
          cheatsMetaMap[name].sync.getter()
        );
      }, 10);
      return () => {
        clearInterval(poll);
      };
    }
  }, [cheatsMetaMap[name].sync]);

  useEffect(() => {
    if (document.activeElement === textInput.current) {
      return;
    }
    if (cheatsMetaMap[name].sync) {
      return;
    }
    textInput.current.value = JSON.stringify(cheatsMap[name]);
  }, [cheatsMap[name], cheatsMetaMap[name].sync]);

  return (
    <input
      type="text"
      ref={textInput}
      onKeyDown={(e) => {
        if ((e.code as KeyCode) === "Enter") {
          try {
            console.log(cheatsMetaMap[name]);
            if (cheatsMetaMap[name].sync) {
              cheatsMetaMap[name].sync.setter(
                JSON.parse(textInput.current.value)
              );
            } else {
              cheatsDispatch({
                type: "set",
                payload: {
                  key: name,
                  value: JSON.parse(textInput.current.value),
                },
              });
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
  const { conVarMetaMap: cheatsMetaMap, conVarMetaDispatch: cheatsMetaDispatch } = useContext(ConVarContext);
  const textInput = useRef(null);

  useEffect(() => {
    if (document.activeElement === textInput.current) {
      return;
    }
    textInput.current.value = JSON.stringify(cheatsMetaMap[name].persistValue);
  }, [cheatsMetaMap[name].persistValue]);

  return (
    <input
      type="text"
      ref={textInput}
      disabled={disabled}
      onKeyDown={(e) => {
        if ((e.code as KeyCode) === "Enter") {
          try {
            cheatsMetaDispatch({
              type: "set-persist-value",
              payload: {
                key: name,
                value: JSON.parse(textInput.current.value),
              },
            });
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

  const { conVarMap: cheatsMap, conVarMetaMap: cheatsMetaMap, conVarMetaDispatch: cheatsMetaDispatch } =
    useContext(ConVarContext);

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
            Object.keys(cheatsMap).map((key) => (
              <tr key={key}>
                <td>{key}</td>
                <td>
                  <CheatInput name={key} />
                </td>
                <td>
                  <input
                    type="checkbox"
                    defaultChecked={cheatsMetaMap[key]?.persist}
                    onChange={(e) => {
                      cheatsMetaDispatch({
                        type: "toggle-persist",
                        payload: {
                          key,
                        },
                      });
                    }}
                  />
                </td>
                <td>
                  <PersistInput
                    name={key}
                    disabled={!cheatsMetaMap[key]?.persist}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
