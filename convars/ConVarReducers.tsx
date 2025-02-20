export type ConVarMapReducerAction =
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

export function conVarMapReducer(state, { type, payload }: ConVarMapReducerAction) {
  switch (type) {
    case "set":
      if (state[payload.key] === payload.value) return state;
      return {
        ...state,
        [payload.key]:
          payload.value instanceof Function
            ? payload.value(state[payload.key])
            : payload.value,
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

export type ConVarMetaMapReducerAction =
  | {
      type: "toggle-persist";
      payload: {
        key: number | string;
      };
    }
  | {
      type: "set-persist";
      payload: {
        key: number | string;
        value: boolean;
      };
    }
  | {
      type: "set-persist-value";
      payload: {
        key: number | string;
        value: any;
      };
    }
  | {
      type: "set-sync";
      payload: {
        key: number | string;
        getter: () => any;
        setter: (value: any) => void;
      };
    }
  | {
      type: "clear-sync";
      payload: {
        key: number | string;
      };
    }
  | {
      type: "delete";
      payload: {
        key: number | string;
      };
    };

export function conVarMetaMapReducer(
  state,
  { type, payload }: ConVarMetaMapReducerAction
) {
  switch (type) {
    case "toggle-persist":
      return {
        ...state,
        [payload.key]: {
          ...state[payload.key],
          persist: !state[payload.key]?.persist,
        },
      };
    case "set-persist":
      return {
        ...state,
        [payload.key]: {
          ...state[payload.key],
          persist: payload.value,
        },
      };
    case "set-persist-value":
      return {
        ...state,
        [payload.key]: {
          ...state[payload.key],
          persistValue: payload.value,
        },
      };
    case "set-sync":
      return {
        ...state,
        [payload.key]: {
          ...state[payload.key],
          sync: {
            setter: payload.setter,
            getter: payload.getter,
          },
        },
      };
    case "clear-sync":
      const stateCopy = {
        ...state[payload.key],
      };
      delete stateCopy["sync"];
      return {
        ...state,
        [payload.key]: stateCopy,
      };
    case "delete":
      const copy = { ...state };
      delete copy[payload.key];
      return copy;
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}
