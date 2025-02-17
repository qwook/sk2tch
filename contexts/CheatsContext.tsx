import EventEmitter from "events";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

export const CheatsContext = createContext<{
  cheatsMap: any;
  cheatsDispatch: React.ActionDispatch<[MapReducerAction]>;
} | null>(null);

export function useCheatState(name, defaultState) {
  const { cheatsMap, cheatsDispatch } = useContext(CheatsContext);

  useEffect(() => {
    cheatsDispatch({
      type: "set",
      payload: {
        key: name,
        value: defaultState,
      },
    });
  }, []);

  return [
    cheatsMap[name],
    useCallback(
      (newState) => {
        cheatsDispatch({
          type: "set",
          payload: {
            key: name,
            value: newState,
          },
        });
      },
      [cheatsMap, cheatsDispatch]
    ),
  ];
}

type MapReducerAction =
  | {
      type: "set";
      payload: {
        key: number | string;
        value: any;
      };
    }
  | {
      type: "delete";
      payload: {
        key: number | string;
      };
    };

function mapReducer(state, { type, payload }: MapReducerAction) {
  switch (type) {
    case "set":
      if (state[payload.key] === payload.value) return state;
      return {
        ...state,
        [payload.key]: payload.value,
      };
    case "delete":
      const copy = { ...state };
      delete copy[payload.key];
      return copy;
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
  return state;
}

export function CheatsProvider({ children }: { children: ReactNode }) {
  const [cheatsMap, dispatch] = useReducer(mapReducer, {});

  return (
    <CheatsContext.Provider value={{ cheatsMap, cheatsDispatch: dispatch }}>
      {children}
    </CheatsContext.Provider>
  );
}
