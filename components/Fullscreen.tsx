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
  const [fullscreen, setFullscreen] = useSettingsState("fullscreen", true);

  useEffect(() => {
    if (!window.electronAPI) {
      setFullscreen(false);
    }

    if (screenfull.isEnabled && screenfull.on) {
      screenfull.on("change", () => {
        setFullscreen(screenfull.isFullscreen);
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (screenfull.isEnabled && screenfull.on) {
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
