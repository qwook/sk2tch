import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Vector2 } from "three";
import { setIntervalPausible, useFrameCanvasless } from "../utils/scheduler";
import "./CustomCursor.scss";
import { isMobile } from "react-device-detect";

const CustomCursorContext = createContext({});

export function CustomCursorProvider({children}) {
  const [busy, setBusy] = useState(0);

  return <CustomCursorContext.Provider value={{busy, setBusy}} >
    {children}
  </CustomCursorContext.Provider>
}

export function useCustomCursor() {
  return useContext(CustomCursorContext);
}

export function CustomCursor({ cursorMap, children }) {
  const wrapper = useRef();
  const trail = useMemo(() => _.range(0, 7), []);
  const sprites = useRef([]);
  const currentTrail = useRef(0);
  const currentCursor = useRef(0);
  const currentCursorPosition = useRef({x: 0, y: 0});
  const goalCursorPosition = useRef({x: 0, y: 0});

  const {busy, setBusy} = useCustomCursor();
  const busyRef = useRef(false);
  busyRef.current = busy;

  useEffect(() => {
    if (!cursorMap) return;
    let cursor = currentCursor.current;

    if (busy) {
      cursor = "busy";
    }

    if (!cursorMap[cursor]) return;

    const currentSprite = sprites.current[currentTrail.current];
    currentSprite.style.top = -(cursorMap[cursor].offsetY || 0) + "px";
    currentSprite.style.left = -(cursorMap[cursor].offsetX || 0) + "px";
    currentSprite.style.backgroundImage = `url(${cursorMap[cursor].img})`;
  }, [busy, cursorMap])

  useEffect(() => {
    const mouseMove = (e) => {
      wrapper.current?.style.cursor = wrapper.current?.style.cursor !== "none" ? "none" : `url(${require("./1x1.png")}), default`;

      if (!sprites.current && sprites.current.length === 0) return;
      const currentSprite = sprites.current[currentTrail.current];
      currentSprite.position = {
        x: e.clientX + window.scrollX,
        y: e.clientY + window.scrollY,
      };
      currentCursorPosition.current = {...currentSprite.position};
      goalCursorPosition.current = {...currentSprite.position};
      currentSprite.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;

      // top: -(cursorMap[currentCursor].offsetY || 0),
      // left: -(cursorMap[currentCursor].offsetX || 0),
      // backgroundImage: `url(${cursorMap[currentCursor].img})`,

      let cursor = "default";
      let closest = e.target.closest(
        ".cursor-pointer, .cursor-move, .cursor-none, input[type='text'], input[type='password']"
      );
      if (closest) {
        if (
          closest.tagName === "INPUT" &&
          (closest.type === "password" || closest.type === "text")
        ) {
          cursor = "beam";
        }
        if (closest.classList.contains("cursor-pointer")) {
          cursor = "pointer";
        }
        if (closest.classList.contains("cursor-move")) {
          cursor = "move";
        }
        if (closest.classList.contains("cursor-none")) {
          cursor = "none";
          currentSprite.style.backgroundImage = "";
          return;
        }
      }
      if (busyRef.current) {
        cursor = "busy";
      }

      currentCursor.current = cursor;

      currentSprite.style.top = -(cursorMap[cursor].offsetY || 0) + "px";
      currentSprite.style.left = -(cursorMap[cursor].offsetX || 0) + "px";
      currentSprite.style.backgroundImage = `url(${cursorMap[cursor].img})`;
    };

    document.addEventListener("pointermove", mouseMove);

    const touchDown = (e) => {
      goalCursorPosition.current = {
        x: e.clientX + window.scrollX,
        y: e.clientY + window.scrollY,
      };
    }
    document.addEventListener("pointerdown", touchDown);

    const cancelInterval = setIntervalPausible(
      () => {
        for (let i = 0; i < sprites.current.length; i++) {
          let curr = sprites.current[i].position || { x: 0, y: 0 };
          let nextSprite = sprites.current[(i + 1) % sprites.current.length];
          let next = nextSprite.position || { x: 0, y: 0 };
          let distance = new Vector2(curr.x, curr.y).distanceTo(
            new Vector2(next.x, next.y)
          );
          if (distance > 30 || isMobile) {
            nextSprite.style.opacity = 1;
          } else {
            const cursor = currentCursor.current;
            // nextSprite.style.top = -(cursorMap[cursor].offsetY || 0) + "px";
            // nextSprite.style.left = -(cursorMap[cursor].offsetX || 0) + "px";
            // nextSprite.style.backgroundImage = `url(${cursorMap[cursor].img})`;
            nextSprite.style.opacity = 0;
          }
        }
        const current = sprites.current[currentTrail.current];
        const nextNext =
          sprites.current[(currentTrail.current + 1) % sprites.current.length];
        nextNext.style.transform = current.style.transform;
        nextNext.style.top = current.style.top;
        nextNext.style.left = current.style.left;
        nextNext.style.backgroundImage = current.style.backgroundImage;
        currentTrail.current =
          (currentTrail.current + 1) % sprites.current.length;
        current.style.opacity = 1;
      },
      5,
      false
    );

    return () => {
      document.removeEventListener("pointermove", mouseMove);
      document.removeEventListener("pointerdown", touchDown);
      cancelInterval();
    };
  });

  useFrameCanvasless((delta) => {

    const currentSprite = sprites.current[currentTrail.current];
    const origin = new Vector2(
      currentCursorPosition.current.x, currentCursorPosition.current.y
    );
    const goal = new Vector2(goalCursorPosition.current.x, goalCursorPosition.current.y);
    const movement = delta * 2;
    if (origin.distanceTo(goal) < movement) {
      origin.x = goal.x;
      origin.y = goal.y;
    } else {
      origin.add(goal.sub(origin).normalize().multiplyScalar(movement));
    }

    currentSprite.position = {
      x: origin.x,
      y: origin.y,
    };
    currentCursorPosition.current = {...currentSprite.position};
    currentSprite.style.transform = `translate(${origin.x}px, ${origin.y}px)`;

  });

  return (
    <div>
      <div
        className="custom-cursor"
        style={{
          zIndex: 1,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        ref={wrapper}
      >
        {children}
      </div>

      {trail.map((idx) => {
        return (
          <div
            className="custom-cursor-image"
            style={{
              zIndex: 2,
              position: "absolute",
              top: 0,
              left: 0,
              // top: -(cursorMap[currentCursor].offsetY || 0),
              // left: -(cursorMap[currentCursor].offsetX || 0),
              // backgroundImage: `url(${cursorMap[currentCursor].img})`,
              width: 200,
              height: 200,
              textAlign: "left",
              pointerEvents: "none",
              userSelect: "none",
              backgroundRepeat: "no-repeat",
            }}
            ref={(ref) => (sprites.current[idx] = ref)}
          ></div>
        );
      })}
    </div>
  );
}
