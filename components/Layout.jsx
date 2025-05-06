import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { createContext } from "react";

export const LayoutContext = createContext();

const Layout = forwardRef(
  (
    {
      targetWidth = 800,
      targetHeight = 600,
      landscapeOnly = false,
      noresize = false,
      children,
    },
    ref
  ) => {
    const [orientation, setOrientation] = useState(
      window.innerWidth / window.innerHeight < 1 ? "portrait" : "landscape"
    );
    const [size, setSize] = useState(1);
    const layoutElement = useRef(null);

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
      if (noresize) {
        setWindowSize({ width: targetWidth, height: targetHeight });
        setSize(1);
        setOrientation("landscape");
      } else {
        const resize = () => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          setWindowSize({ width, height });
          const ratio = width / height;
          const orientation = landscapeOnly
            ? "landscape"
            : ratio < 1
            ? "portrait"
            : "landscape";
          setOrientation(orientation);

          if (orientation === "landscape") {
            if (ratio < targetWidth / targetHeight) {
              setSize(width / targetWidth);
            } else {
              setSize(height / targetHeight);
            }
          }
          if (orientation === "portrait") {
            if (ratio < targetHeight / targetWidth) {
              setSize(width / targetHeight);
            } else {
              setSize(height / targetWidth);
            }
          }
        };
        window.addEventListener("resize", resize);
        resize();
        return () => {
          window.removeEventListener("resize", resize);
        };
      }
    }, [noresize]);

    return (
      <LayoutContext.Provider
        value={{ layoutElement, size, orientation, targetWidth, targetHeight }}
      >
        <div
          className="layout"
          ref={layoutElement}
          style={{
            position: "absolute",
            left:
              orientation === "landscape"
                ? windowSize.width / 2 - (targetWidth / 2) * size
                : windowSize.width / 2 - (targetHeight / 2) * size,
            top:
              orientation === "landscape"
                ? windowSize.height / 2 - (targetHeight / 2) * size
                : windowSize.height / 2 - (targetWidth / 2) * size,
            width:
              orientation === "landscape"
                ? targetWidth * size
                : targetHeight * size,
            height:
              orientation === "landscape"
                ? targetHeight * size
                : targetWidth * size,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </LayoutContext.Provider>
    );
  }
);

export default Layout;
