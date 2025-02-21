/**
 * Console Variables are variables that can be changed while in game.
 * Frequently used for cheats and for testing. They are also used to store settings.
 */

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { saveStorage, loadStorage } from "../utils/SaveFile";
import {
  conVarMetaMapReducer,
  conVarMapReducer,
  ConVarMapReducerAction,
  ConVarMetaMapReducerAction,
} from "./ConVarReducers";
import { createStore, useStore } from "zustand";
import { produce } from "immer";

// Todo: Combine conVarMap and conVarMetaMap into a single map.

export const ConVarContext = createContext(null);

const initialConVarMetaMap = loadStorage("conVarPersistMap");

function ConVarSaver() {
  const { conVarStore } = useContext(ConVarContext);
  const persistMap = useStore(conVarStore, (state: any) => state.persistMap);

  useEffect(() => {
    saveStorage("conVarPersistMap", persistMap);
  }, [persistMap]);

  return <></>;
}

const defaultConVar = {
  value: null,
  sync: undefined,
  persist: false,
};

const defaultPersist = {
  value: null,
  enabled: false,
};

export function ConVarProvider({ children }: { children: ReactNode }) {
  const conVarStore = useMemo(
    () =>
      createStore((set) => ({
        conVarMap: {},
        persistMap: initialConVarMetaMap || {},
        setConVar: (key, value) =>
          set((state) => {
            value =
              value instanceof Function
                ? value(state.conVarMap[key].value)
                : value;
            return produce(state, (draft) => {
              if (draft.conVarMap[key]) {
                draft.conVarMap[key].value = value;
              } else {
                draft.conVarMap[key] = produce(defaultConVar, (draft) => {
                  draft.value = value;
                });
              }
            });
          }),
        setSync: (key, getter, setter) =>
          set((state) => {
            return produce(state, (draft) => {
              if (draft.conVarMap[key]) {
                draft.conVarMap[key].sync = { getter, setter };
              } else {
                draft.conVarMap[key] = produce(defaultConVar, (draft) => {
                  draft.sync = { getter, setter };
                });
              }
            });
          }),
        clearSync: (key) =>
          set((state) => {
            return produce(state, (draft) => {
              if (draft.conVarMap[key]) {
                delete draft.conVarMap[key].sync;
              }
            });
          }),
        setPersistEnabled: (key, persist) =>
          set((state) => {
            return produce(state, (draft) => {
              if (draft.persistMap[key]) {
                draft.persistMap[key].enabled = persist;
              } else {
                draft.persistMap[key] = produce(defaultPersist, (draft) => {
                  draft.enabled = persist;
                });
              }
            });
          }),
        setPersistValue: (key, value) =>
          set((state) => {
            return produce(state, (draft) => {
              if (draft.persistMap[key]) {
                draft.persistMap[key].value = value;
              } else {
                draft.persistMap[key] = produce(defaultPersist, (draft) => {
                  draft.value = value;
                });
              }
            });
          }),
      })),
    []
  );

  return (
    <ConVarContext.Provider
      value={{
        conVarStore,
      }}
    >
      <ConVarSaver />
      {children}
    </ConVarContext.Provider>
  );
}
