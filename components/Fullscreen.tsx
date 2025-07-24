import { isMobile } from "react-device-detect";
import { useEffect } from "react";
import screenfull from "screenfull";
import { useSettingsState } from "../features/convars/ConVarHooks";

declare global {
  interface Window {
    electronAPI: any;
  }
}

export function Fullscreen() {
  /*
  useEffect(() => {
    if (!isMobile && screenfull.isEnabled && screenfull.on && screenfull.off) {
      const screenFullChange = () => {
        setShowFullscreen(!isMobile && !screenfull.isFullscreen);
      };
      screenfull.on("change", screenFullChange);
      return () => {
        screenfull.off("change", screenFullChange);
      };
    }
  }, []);
  */

  const [fullscreen, setFullscreen] = useSettingsState("fullscreen", true);

  useEffect(() => {
    if (!window.electronAPI) {
      setFullscreen(false);
    }

    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        setFullscreen(screenfull.isFullscreen);
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (screenfull.isEnabled) {
        if (fullscreen) {
          if (window.electronAPI) {
            window.electronAPI?.setFullscreen(true);
          } else {
            try {
              if (!screenfull.isFullscreen) {
                await screenfull.request();
                if (!screenfull.isFullscreen) {
                  setFullscreen(false);
                }
              }
            } catch (e) {
              // Error, set full screen to false.
              setFullscreen(false);
            }
          }
        } else {
          if (window.electronAPI) {
            window.electronAPI?.setFullscreen(false);
          } else {
            if (screenfull.isFullscreen) {
              try {
                screenfull.exit();
              } catch (e) {}
            }
          }
        }
      }
    })();
  }, [fullscreen]);

  return <></>;
}
