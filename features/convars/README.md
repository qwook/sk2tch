# Console Variables

"ConVar" is short for "console variables." They are inspired by the Source
Engine's console variables. Console variables lets you adjust settings and
parameters while the game is playing, to test things without a full restart.

## Lore

So why have ConVars? When React is used properly, games using sk2tch should
already have fast reloading. However, there are cases where a developer needs to
change a bunch of variables in multiple files to skip to a later stage in a
game.

Previously, a file named "sv_cheats.tsx" was used, but it was a hacky solution
and there can be instances where the game is accidentally shipped with cheats
on. This was the case for "And You'll Miss It" where the game was shipped
multiple times with the stage skipped far into the middle.

Having an "sv_cheats.tsx" file wouldn't work for scaling the engine out to
handle multiple games. How do you extend it to have more cheats? Would it
contain all cheats from all games? And what about reusable components that have
cheats?

## Producer vs. Consumer Console Variables

Producers and Consumers functionally work the same, except Producers should only
be called once in an instance of a game, and allows for default variables to be
passed in. Usually "Producers" are used exactly where the ConVar is used in the
game. "Consumer" is used for settings, or any peripheral components.

I am open for better name suggestions and

`useCheatState()`, `useSettingsState()`, and `useCheatSync()` are producers.

`useCheatConsumer` and `useSettingsConsumer` are consumers.

## Console Variable Persistance

Persistance allows console variables to have a custom default variable, even after restarting the game.

All settings will have persistance automatically turned on – persistance can't be turned off.

## `useCheatState(name, defaultValue?)`

Used just like a `useState()`

## `useCheatSync(name, getter, setter)`

Used to sync variables that don't need to be a react state. This can be things like `ele.style.color`. Synced variables need to be manually polled for changes, usually only when the cheats menu is open.

## `useSettingsState()`

This is like a cheat state, and shows up as a cheat, except persistance is enabled by default and the persistance variable is synced with the console variable value.

Manipulating the settings state should only be done in the settings menu.
