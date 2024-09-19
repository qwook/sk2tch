// I'll figure this out later...
// I'd want a system like Valve's convars:
// https://developer.valvesoftware.com/wiki/ConVar
// However, since this is the land of Javascript
// we can easily loop through Object.keys() to get the
// name.

const cheats: {
  [key: string]: any;
} = {
  IGNORE_SAVE: false,
};

export default cheats;