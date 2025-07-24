import { useRef } from "react";

import EventEmitter from "events";
import { JoystickContext } from "../contexts/JoystickContext";

export function JoystickInputProvider() {
  const keyDown = useRef({});
  const axes = useRef({
    xRaw: 0,
    yRaw: 0,
    x: 0,
    y: 0,
    left: 0,
    right: 0,
  });
  const eventEmitter = useRef(new EventEmitter());

  // Events:
  /*
    "buttonpress",
    "buttondown",
    "buttonup",
  */

  return (
    <JoystickContext.Provider
      value={{
        keyDown,
        on: eventEmitter.current.on.bind(eventEmitter),
        off: eventEmitter.current.off.bind(eventEmitter),
      }}
    ></JoystickContext.Provider>
  );
}
