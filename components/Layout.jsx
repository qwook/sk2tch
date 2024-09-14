import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { createContext } from "react";

export const LayoutContext = createContext();

const Layout = forwardRef(({ children }, ref) => {
  const [orientation, setOrientation] = useState(
    window.innerWidth / window.innerHeight < 1 ? "portrait" : "landscape"
  );
  const [size, setSize] = useState(1);

  useImperativeHandle(
    ref,
    () => ({
      orientation,
      size,
    }),
    [orientation, size]
  );

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });
      const ratio = width / height;
      const orientation = ratio < 1 ? "portrait" : "landscape";
      setOrientation(orientation);

      if (orientation === "landscape") {
        if (ratio < 4 / 3) {
          setSize(width / 800);
        } else {
          setSize(height / 600);
        }
      }
      if (orientation === "portrait") {
        if (ratio < 3 / 4) {
          setSize(width / 600);
        } else {
          setSize(height / 800);
        }
      }
    };
    window.addEventListener("resize", resize);
    resize();
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <LayoutContext.Provider value={{ size, orientation }}>
      <div
        style={{
          position: "absolute",
          left:
            orientation === "landscape"
              ? windowSize.width / 2 - (800 / 2) * size
              : windowSize.width / 2 - (600 / 2) * size,
          top:
            orientation === "landscape"
              ? windowSize.height / 2 - (600 / 2) * size
              : windowSize.height / 2 - (800 / 2) * size,
          width: orientation === "landscape" ? 800 * size : 600 * size,
          height: orientation === "landscape" ? 600 * size : 800 * size,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </LayoutContext.Provider>
  );
});

export default Layout;
