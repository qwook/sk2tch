import { useContext } from "react";
import { ConVarContext } from "./ConVarContext";
import { useEffect } from "react";
import { useCallback } from "react";

export function useCheatState(name, defaultState) {
  const { conVarMap, conVarDispatch, conVarMetaMap, conVarMetaDispatch } =
    useContext(ConVarContext);

  useEffect(() => {
    conVarDispatch({
      type: "set",
      payload: {
        key: name,
        value: conVarMetaMap[name]?.persist
          ? conVarMetaMap[name].persistValue
          : defaultState,
      },
    });
    conVarMetaDispatch({
      type: "clear-sync",
      payload: {
        key: name,
      },
    });
    return () => {
      conVarDispatch({
        type: "delete",
        payload: {
          key: name,
        },
      });
      conVarMetaDispatch({
        type: "delete",
        payload: {
          key: name,
        },
      });
    };
  }, []);

  return [
    conVarMap[name],
    useCallback(
      (newState) => {
        conVarDispatch({
          type: "set",
          payload: {
            key: name,
            value: newState,
          },
        });
      },
      [conVarMap, conVarDispatch]
    ),
  ];
}

/**
 * useCheatSync
 *
 * Provide a getter and setter function. Registers a cheat that exists not as a react state.
 */
export function useCheatSync(name, getter, setter) {
  const {
    conVarMetaDispatch: conVarMetaDispatch,
    conVarDispatch: conVarDispatch,
  } = useContext(ConVarContext);

  const getterCb = useCallback(getter, []);
  const setterCb = useCallback(setter, []);

  useEffect(() => {
    conVarDispatch({
      type: "set",
      payload: {
        key: name,
        value: null,
      },
    });
    conVarMetaDispatch({
      type: "set-sync",
      payload: {
        key: name,
        getter: getterCb,
        setter: setterCb,
      },
    });
    return () => {
      conVarMetaDispatch({
        type: "clear-sync",
        payload: {
          key: name,
        },
      });
      conVarDispatch({
        type: "delete",
        payload: {
          key: name,
        },
      });
    };
  }, [name, getterCb, setterCb]);
}

/**
 * It's a convar that is both consistent throughout reloads and changes.
 *
 * @param name
 * @param defaultValue
 */
export function useSettingsState(name, defaultValue) {
  const { conVarMetaDispatch } = useContext(ConVarContext);

  const [setting, setSetting] = useCheatState(name, defaultValue);

  useEffect(() => {
    conVarMetaDispatch({
      type: "set-persist",
      payload: {
        key: name,
        value: true,
      },
    });
  }, []);

  useEffect(() => {
    conVarMetaDispatch({
      type: "set-persist-value",
      payload: {
        key: name,
        value: setting,
      },
    });
  }, [setting]);

  return [setting, setSetting];
}
