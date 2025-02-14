import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { LayoutContext } from "sk2tch/components/Layout";
import { useSaveState } from "sk2tch/utils/SaveFile";

export const WindowManagerContext = createContext();

function WindowInternals(props) {
  return <>{props.children}</>;
}

export default function Window(props) {
  const { zOrder, setZOrder, visibleWindows, setVisibleWindows } =
    useContext(WindowManagerContext);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mouseDown, setMouseDown] = useState(false);
  const mouseMove = useRef(null);
  const mouseUp = useRef(null);
  const hasSetInitialPosition = useRef(false);
  const topBarRef = useRef(null);

  useEffect(() => {
    // Add event listener to topbar ref for touchstart, then clean it up.
    const topBar = topBarRef.current;
    if (topBar) {
      const touchStart = (e) => {
        e.preventDefault();
      };
      topBar.addEventListener("touchstart", touchStart);
      return () => {
        topBar.removeEventListener("touchstart", touchStart);
      };
    }
  }, []);

  const isVisible = visibleWindows.includes(props.name);
  const [lastVisible, setLastVisible] = useState(false);
  const onVisibleChange = props.onVisibleChange;
  useLayoutEffect(() => {
    if (isVisible !== lastVisible) {
      if (onVisibleChange) {
        onVisibleChange(isVisible);
      }
      if (isVisible && !hasSetInitialPosition.current) {
        setPosition(props.initialPosition);
        hasSetInitialPosition.current = true;
      }
    }
    setLastVisible(isVisible);
  }, [
    props.initialPosition,
    lastVisible,
    onVisibleChange,
    setLastVisible,
    isVisible,
  ]);

  const lastWindowPosition = useRef({ x: 0, y: 0 });
  const lastMousePosition = useRef({ x: 0, y: 0 });

  const layoutContext = useContext(LayoutContext);

  // why did i make this a ref lol
  mouseMove.current = (e) => {
    if (mouseDown) {
      // Set position, clamp to the screen.
      const newMousePosition = {
        x:
          e.clientX ||
          e.pageX ||
          (e.touches && e.touches[0]?.pageX) ||
          (e.touches && e.touches[0]?.clientX),
        y:
          e.clientY ||
          e.pageY ||
          (e.touches && e.touches[0]?.pageY) ||
          (e.touches && e.touches[0]?.clientY),
      };

      if (
        newMousePosition.x === undefined ||
        newMousePosition.y === undefined
      ) {
        return;
      }

      setPosition({
        x: Math.max(
          -300,
          Math.min(
            lastWindowPosition.current.x +
              (newMousePosition.x - lastMousePosition.current.x) /
                layoutContext.size,
            800 - 100
          )
        ),
        y: Math.max(
          0,
          Math.min(
            lastWindowPosition.current.y +
              (newMousePosition.y - lastMousePosition.current.y) /
                layoutContext.size,
            600 - 100
          )
        ),
      });
    }
  };

  mouseUp.current = (e) => {
    if (mouseUp) {
      setMouseDown(false);
    }
  };

  useEffect(() => {
    setZOrder((zOrder) => {
      if (zOrder.includes(props.name)) {
        return zOrder;
      } else {
        return [...zOrder, props.name];
      }
    });
    setPosition(props.initialPosition);
    const mouseMoveEvent = (e) => {
      mouseMove.current(e);
    };
    document.body.addEventListener("mousemove", mouseMoveEvent);
    document.body.addEventListener("touchmove", mouseMoveEvent);
    const mouseUpEvent = (e) => {
      mouseUp.current(e);
    };
    document.body.addEventListener("mouseup", mouseUpEvent);
    document.body.addEventListener("touchend", mouseUpEvent);
    return () => {
      document.body.removeEventListener("mousemove", mouseMoveEvent);
      document.body.removeEventListener("mouseup", mouseUpEvent);
      document.body.removeEventListener("touchmove", mouseMoveEvent);
      document.body.removeEventListener("touchend", mouseUpEvent);
    };
  }, []);

  const size = useContext(LayoutContext).size;

  return (
    <div
      className={[
        "window",
        isVisible ? "pop-up" : "",
        props.fullscreen ? "fullscreen" : "",
      ].join(" ")}
      style={Object.assign(
        {
          position: "absolute",
          display: "inline-block",
          visibility: visibleWindows.includes(props.name)
            ? "visible"
            : "hidden",
          top: position.y * size,
          left: position.x * size,
          background: "#ccc",
          zIndex: zOrder.indexOf(props.name),
          textAlign: "left",
          // overflow: "hidden",
          border: `${size}px solid #245DDA`,
          borderRadius: 12 * size,
          boxShadow: `${5 * size}px ${5 * size}px ${10 * size}px -${
            5 * size
          }px #000000`,
          transform: "translate3d(0,0,0)",
          overflow: "hidden",
        },
        props.style || {}
      )}
      onMouseDown={(e) => {
        if (zOrder[zOrder.length - 1] !== props.name) {
          setZOrder((zOrder) => {
            return [
              ...zOrder.filter((name) => name !== props.name),
              props.name,
            ];
          });
        }
      }}
      onTouchStart={(e) => {
        if (zOrder[zOrder.length - 1] !== props.name) {
          setZOrder((zOrder) => {
            return [
              ...zOrder.filter((name) => name !== props.name),
              props.name,
            ];
          });
        }
      }}
    >
      <div
        style={
          props.topBarStyle || {
            padding: `${10 * size}px`,
            // The top bar gradient for Windows 95 have the hex colors: #ffffff, #ebebeb, #d4d0d4, #e3e3e3, #f0f0f0, #f0f0f0, #e3e3e3, #d4d0d4, #ebebeb, #ffffff
            background: "linear-gradient(90deg, #245DDA 0%, #4F9FDF 100%)",
            color: "white",
            userSelect: "none",
            cursor: "move",
            fontSize: 14 * size,
          }
        }
        ref={topBarRef}
        onMouseDown={(e) => {
          setMouseDown(true);
          lastMousePosition.current = {
            x: e.clientX || e.pageX,
            y: e.clientY || e.pageY,
          };
          lastWindowPosition.current = {
            x: position.x,
            y: position.y,
          };
          if (zOrder[zOrder.length - 1] !== props.name) {
            setZOrder((zOrder) => {
              return [
                ...zOrder.filter((name) => name !== props.name),
                props.name,
              ];
            });
          }
          e.preventDefault();
        }}
        onTouchStart={(e) => {
          setMouseDown(true);
          var touch = e.touches[0] || e.changedTouches[0];
          lastMousePosition.current = {
            x: touch.pageX,
            y: touch.pageY,
          };
          lastWindowPosition.current = {
            x: position.x,
            y: position.y,
          };
          setZOrder((zOrder) => {
            return [
              ...zOrder.filter((name) => name !== props.name),
              props.name,
            ];
          });
        }}
      >
        {props.title}
        <div
          style={
            props.closeButtonStyle || {
              position: "absolute",
              top: 3 * size,
              right: 3 * size,
              background: "red",
              padding: `${5 * size}px ${10 * size}px`,
              fontWeight: "bold",
              borderRadius: 6 * size,
              border: `${2 * size}px solid white`,
              cursor: "pointer",
            }
          }
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            if (!props.disableCloseButton) {
              setVisibleWindows((visibleWindows) => {
                return visibleWindows.filter((name) => name !== props.name);
              });
            }
          }}
          onClick={(e) => {
            if (!props.disableCloseButton) {
              setVisibleWindows((visibleWindows) => {
                return visibleWindows.filter((name) => name !== props.name);
              });
            }
          }}
        >
          x
        </div>
      </div>
      <div
        style={{ height: "100%", pointerEvents: mouseDown ? "none" : "auto" }}
      >
        {props.children}
      </div>
    </div>
  );
}

export const WindowManager = forwardRef(
  ({ children, visibleWindows, setVisibleWindows }, ref) => {
    const [zOrder, setZOrder] = useState([]);

    const makeWindowVisible = (name) => {
      setVisibleWindows((visibleWindows) => {
        if (!visibleWindows.includes(name)) {
          return [...visibleWindows, name];
        } else {
          return visibleWindows;
        }
      });
    };

    const makeWindowInvisible = (name) => {
      setVisibleWindows((visibleWindows) => {
        return visibleWindows.filter((n) => n !== name);
      });
    };

    const bringToTop = (name) => {
      setZOrder((zOrder) => {
        return [...zOrder.filter((n) => n !== name), name];
      });
    };

    useImperativeHandle(ref, () => {
      return {
        makeWindowVisible,
        makeWindowInvisible,
        bringToTop,
      };
    });

    return (
      <WindowManagerContext.Provider
        value={{
          zOrder,
          setZOrder,
          visibleWindows,
          setVisibleWindows,
          makeWindowVisible,
          makeWindowInvisible,
          bringToTop,
        }}
      >
        {children}
      </WindowManagerContext.Provider>
    );
  }
);
