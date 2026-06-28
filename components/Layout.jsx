import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { createContext } from "react";
import "./layout.scss";

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
    ref,
  ) => {
    const [orientation, setOrientation] = useState(
      window.innerWidth / window.innerHeight < 1 ? "portrait" : "landscape",
    );
    const [size, setSize] = useState(1);
    const layoutElement = useRef(null);

    useImperativeHandle(
      ref,
      () => ({
        orientation,
        size,
      }),
      [orientation, size],
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

          let size = 0;

          if (orientation === "landscape") {
            if (ratio < targetWidth / targetHeight) {
              setSize(width / targetWidth);
              size = width / targetWidth;
            } else {
              setSize(height / targetHeight);
              size = height / targetHeight;
            }
          }
          if (orientation === "portrait") {
            if (ratio < targetHeight / targetWidth) {
              setSize(width / targetHeight);
              size = width / targetHeight;
            } else {
              setSize(height / targetWidth);
              size = height / targetWidth;
            }
          }

          layoutElement.current.style.top =
            Math.floor(
              orientation === "landscape"
                ? height / 2 - (targetHeight / 2) * size
                : height / 2 - (targetWidth / 2) * size,
            ) + "px";

          layoutElement.current.style.width =
            Math.floor(
              orientation === "landscape"
                ? targetWidth * size
                : targetHeight * size,
            ) + "px";

          layoutElement.current.style.height =
            Math.floor(
              orientation === "landscape"
                ? targetHeight * size
                : targetWidth * size,
            ) + "px";

          layoutElement.current.style.fontSize = size * 12 + "px";
        };
        window.addEventListener("resize", resize);
        resize();
        return () => {
          window.removeEventListener("resize", resize);
        };
      }
    }, [noresize, targetWidth, targetHeight]);

    return (
      <LayoutContext.Provider
        value={{ layoutElement, size, orientation, targetWidth, targetHeight }}
      >
        <div className="layout" ref={layoutElement}>
          {children}
        </div>
      </LayoutContext.Provider>
    );
  },
);

export default Layout;
