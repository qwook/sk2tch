/**
 * Console Variables are variables that can be changed while in game.
 * Frequently used for cheats and for testing. They are also used to store settings.
 */

import { produce } from "immer";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { createStore, StoreApi, useStore } from "zustand";
import { loadStorage, saveStorage } from "../../utils/save-file";

// Todo: Combine conVarMap and conVarMetaMap into a single map.

export const ConVarContext = createContext<{
  conVarStore: StoreApi<ReturnType<ReturnType<typeof ConVarStore>>>;
}>(null);

// const initialConVarMetaMap = loadStorage("conVarPersistMap");

const ConVarStore = (persistMap) => (set) => ({
  conVarMap: {},
  // persistMap: {},
  persistMap,
  loadedPersist: {},
  setConVar: (key, value) =>
    set((state) => {
      value =
        value instanceof Function ? value(state.conVarMap[key].value) : value;
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
  setPersistMap: (persistMap) => {
    set((state) => {
      return produce(state, (draft) => {
        draft.persistmap = persistMap;
      });
    });
  },
  setLoadedPersist: (key) => {
    set((state) => {
      return produce(state, (draft) => {
        draft.loadedPersist[key] = true;
      });
    });
  },
});

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
    () => createStore(ConVarStore(loadStorage("conVarPersistMap"))),
    []
  );
  const persistMap = useStore(conVarStore, (state: any) => state.persistMap);

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
