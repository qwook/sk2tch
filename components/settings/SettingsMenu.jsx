import Window, { WindowManager } from "sk2tch/components/Window";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { resetSave, save } from "sk2tch/utils/SaveFile";

import { LayoutContext } from "sk2tch/components/Layout";
import { isMobile } from "react-device-detect";
import { l10n } from "sk2tch/utils/l10n";
import { setPaused } from "sk2tch/utils/scheduler";
import { STANDALONE_APP } from "sk2tch/utils/defines";
import escapeCssUrl from "sk2tch/utils/escapeCssUrl";

export const SettingsContext = createContext({
  masterVolume: 1.0,
  sfxVolume: 1.0,
  musicVolume: 1.0,
});

function Checkbox({ value, onValueChange, children }) {
  const { size } = useContext(LayoutContext);

  return (
    <div
      onClick={() => {
        onValueChange && onValueChange(!value);
      }}
    >
      <div
        style={{
          width: 20 * size,
          height: 20 * size,
          border: "1px solid black",
          display: "inline-block",
          marginRight: 10 * size,
          backgroundColor: "white",
          backgroundImage: value
            ? `url(${escapeCssUrl(require("../assets/check.png"))})`
            : "",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          boxShadow: "inset 1px 1px 5px 0px rgba(0,0,0,0.5)",
          verticalAlign: "middle",
        }}
      ></div>
      {children}
    </div>
  );
}

function Slider({ slideMinMax, value, onValueChange }) {
  let [sliding, setSliding] = useState(false);
  const ref = useRef();

  const { size } = useContext(LayoutContext);

  const mouseChange = useCallback(
    (e) => {
      if (!sliding) {
        return;
      }
      const rect = ref.current.getBoundingClientRect();
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

      // const rect = ref.current.getBoundingClientRect();
      // const x = e.clientX - rect.left;
      const x = newMousePosition.x - rect.left;
      onValueChange &&
        onValueChange(
          Math.max(
            Math.min(
              (x / rect.width) * (slideMinMax[1] - slideMinMax[0]) +
                slideMinMax[0],
              slideMinMax[1]
            ),
            0
          )
        );
    },
    [slideMinMax, sliding, onValueChange]
  );

  useEffect(() => {
    const stopSliding = () => {
      setSliding(false);
    };
    window.document.body.addEventListener("mousemove", mouseChange);
    window.document.body.addEventListener("mouseup", stopSliding);
    window.document.body.addEventListener("touchmove", mouseChange);
    window.document.body.addEventListener("touchend", stopSliding);
    return () => {
      window.document.body.removeEventListener("mousemove", mouseChange);
      window.document.body.removeEventListener("mouseup", stopSliding);
      window.document.body.removeEventListener("touchmove", mouseChange);
      window.document.body.removeEventListener("touchend", stopSliding);
    };
  }, [mouseChange]);

  return (
    <div
      style={{
        width: "100%",
        height: 20 * size,
        // border: "1px solid black",
        display: "inline-block",
        marginTop: 10 * size,
        marginRight: 10 * size,
        // background: "white",
        position: "relative",
      }}
      ref={ref}
      onMouseDown={(e) => {
        setSliding(true);
        sliding = true;
        mouseChange(e);
      }}
      onTouchStart={(e) => {
        setSliding(true);
        sliding = true;
        mouseChange(e);
      }}
      onMouseMove={mouseChange}
    >
      <div
        style={{
          marginTop: 4 * size,
          border: `${2 * size}px inset white`,
        }}
      ></div>
      <div
        style={{
          margin: 4 * size,
          position: "relative",
        }}
      >
        {/* <div
        style={{
          width: `${(value / (slideMinMax[1] - slideMinMax[0])) * 100}%`,
          height: "100%",
          background: "black",
          pointerEvents: "none",
        }}
      /> */}
        <div
          style={{
            position: "absolute",
            left: `${(value / (slideMinMax[1] - slideMinMax[0])) * 100}%`,
            top: -5 * size,
            transform: "translate(-50%, -50%)",
            width: 30 * size,
            height: 30 * size,
            backgroundImage: `url(${escapeCssUrl(
              require("../assets/slider.png")
            )})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        ></div>
      </div>
    </div>
  );
}

if (STANDALONE_APP) {
  if (navigator && navigator.keyboard && navigator.keyboard.lock) {
    navigator.keyboard.lock(["Escape"]);
  }
}

export default function EscapeMenu({
  masterVolume,
  setMasterVolume,
  sfxVolume,
  setSfxVolume,
  musicVolume,
  setMusicVolume,
  fullscreen,
  setFullscreen,
  onChangeLanguage,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Add listener to "ESC" key, then remove listener when this component unmounts:

    const keyDown = (e) => {
      if (e.key === "Escape") {
        setVisible((visible) => !visible);
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", keyDown);
    return () => {
      document.removeEventListener("keydown", keyDown);
    };
  });

  const { orientation, size } = useContext(LayoutContext);
  const { language } = useContext(l10n.Context);
  const windowManager = useRef();

  const [visibleWindows, setVisibleWindows] = useState(["escape-menu"]);

  useEffect(() => {
    setPaused(visible);
    if (visible) {
      setVisibleWindows(["escape-menu"]);
    }
  }, [visible]);

  return (
    <>
      {visible && (
        <div
          style={{
            zIndex: 99999, // Oh god I need a better system.
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.8)",
          }}
        >
          <div
            style={{
              color: "white",
              textAlign: "center",
              marginTop: 20 * size,
            }}
          >
            Paused
          </div>
          <WindowManager
            ref={windowManager}
            visibleWindows={visibleWindows}
            setVisibleWindows={setVisibleWindows}
          >
            <Window
              name="exit-warning"
              title="Warning!"
              initialPosition={{
                x: 235,
                y: 130,
              }}
            >
              <div
                style={{
                  width: 300 * size,
                  padding: 10 * size,
                  textAlign: "center",
                  fontFamily: "sans-serif",
                }}
              >
                Are you sure you want to exit? Your progress will not be saved.
                <br />
                <br />
                <div
                  className="button-98"
                  style={{
                    display: "inline-block",
                  }}
                  onClick={(e) => {
                    window.electronAPI?.quitApp();
                  }}
                >
                  Yes, I'm Sure
                </div>
                <div
                  className="button-98"
                  style={{
                    display: "inline-block",
                  }}
                  onClick={(e) => {
                    windowManager.current.makeWindowInvisible("exit-warning");
                  }}
                >
                  Cancel
                </div>
              </div>
            </Window>
            <Window
              name="escape-menu"
              title={<l10n.Text name="SETTINGS_TITLE" />}
              initialPosition={{
                x: orientation === "landscape" ? 270 : 170,
                y: 100,
              }}
              style={{
                width: 250 * size,
                fontFamily: "sans-serif",
              }}
              onVisibleChange={(visible) => {
                if (!visible) {
                  setVisible(false);
                }
              }}
            >
              <div
                style={{
                  margin: 10 * size,
                }}
              >
                {!isMobile && (
                  <Checkbox value={fullscreen} onValueChange={setFullscreen}>
                    <l10n.Text name="SETTINGS_FULLSCREEN" />
                  </Checkbox>
                )}
                <br />
                <l10n.Text name="SETTINGS_MASTER_VOLUME" /> <br />
                <Slider
                  slideMinMax={[0, 1]}
                  value={masterVolume}
                  onValueChange={setMasterVolume}
                />
                <br />
                <l10n.Text name="SETTINGS_SFX_VOLUME" /> <br />
                <Slider
                  slideMinMax={[0, 1]}
                  value={sfxVolume}
                  onValueChange={setSfxVolume}
                />
                <br />
                <l10n.Text name="SETTINGS_MUSIC_VOLUME" /> <br />
                <Slider
                  slideMinMax={[0, 1]}
                  value={musicVolume}
                  onValueChange={setMusicVolume}
                />
                <br />
                {STANDALONE_APP && (
                  <div
                    className="button-98"
                    onClick={(e) => {
                      windowManager.current.makeWindowVisible("exit-warning");
                      windowManager.current.bringToTop("exit-warning");
                    }}
                  >
                    <l10n.Text name="SETTINGS_QUIT_GAME" />
                  </div>
                )}
                {SHOW_LANGUAGE_MENU && (
                  <div
                    className="button-98"
                    onClick={(e) => {
                      onChangeLanguage(true);
                    }}
                  >
                    <l10n.Text name="SETTINGS_LANGUAGE" />: {language.NAME}
                  </div>
                )}
                <div
                  className="button-98"
                  onClick={(e) => {
                    resetSave();
                  }}
                >
                  <l10n.Text name="SETTINGS_DELETE_SAVE" />
                </div>
              </div>
            </Window>
          </WindowManager>
        </div>
      )}
      {isMobile && (
        <div
          style={{
            zIndex: 5000,
            position: "absolute",
            right: 10,
            bottom: 10,
            width: 25,
            height: 25,
            background: `url(${escapeCssUrl(
              require("../assets/gear.png")
            )}) no-repeat center center / contain`,
            opacity: 0.5,
            // On hover
            transition: "opacity 0.5s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = 1;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = 0.5;
          }}
          onClick={(e) => {
            setVisible(true);
          }}
        ></div>
      )}
    </>
  );
}
