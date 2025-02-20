/**
 * Console Variables are variables that can be changed while in game.
 * Frequently used for cheats and for testing. They are also used to store settings.
 */

import { createContext, ReactNode, useEffect, useReducer } from "react";
import { saveStorage, loadStorage } from "../utils/SaveFile";
import {
  conVarMetaMapReducer,
  conVarMapReducer,
  ConVarMapReducerAction,
  ConVarMetaMapReducerAction,
} from "./ConVarReducers";

// Todo: Combine conVarMap and conVarMetaMap into a single map.

export const ConVarContext = createContext<{
  conVarMap: any;
  conVarDispatch: React.ActionDispatch<[ConVarMapReducerAction]>;
  conVarMetaMap: { [key: string]: any };
  conVarMetaDispatch: React.ActionDispatch<[ConVarMetaMapReducerAction]>;
} | null>(null);

const initialConVarMetaMap = loadStorage("conVarMetaMap");
export function ConVarProvider({ children }: { children: ReactNode }) {
  // Actual stored ConVar values.
  const [conVarMap, conVarDispatch] = useReducer(conVarMapReducer, {});
  // Information about the ConVar.
  const [conVarMetaMap, conVarMetaDispatch] = useReducer(
    conVarMetaMapReducer,
    initialConVarMetaMap
  );

  useEffect(() => {
    saveStorage("conVarMetaMap", conVarMetaMap);
  }, [conVarMetaMap]);

  return (
    <ConVarContext.Provider
      value={{
        conVarMap: conVarMap,
        conVarDispatch: conVarDispatch,
        conVarMetaMap: conVarMetaMap,
        conVarMetaDispatch: conVarMetaDispatch,
      }}
    >
      {children}
    </ConVarContext.Provider>
  );
}
