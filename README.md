# sk2tch engine

The "engine" for last seen online. It's actually more of a build tool with a bunch
of libraries to handle sound, graphics, programmatic animation, and general game stuff.

I originally had a massive React website that held every single one of my
creative coding sketches. One of the sketches named "horror" eventually became
"last seen online."

I'm pulling out and open sourcing all the common functions I use, as well as
slowly convert it over to Typescript.

# Inspirations

The sk2tch CLI is heavily based off of "bazel" or "blaze" from Google. Like a BUILD,
you define config file for your project:

```tsx
import { Sk2tchConfig } from "sk2tch/cli/sk2tch.config";

const config: Sk2tchConfig = {
  name: "And You'll Miss It",
  code: "aymi",

  entry: "./index.tsx",
  output: "./dist",

  // (Optional)
  analytics: {
    googleTag: "G-XXX",
  },

  // (Optional)
  releasing: {
    appId: "com.aymi",
    osx: {
      appleApiKey:
        "XXX.p8",
      appleApiKeyId: "XXX",
      appleApiIssuer: "XXX",
    },
  },
};
export default config;
```

Then you run:
```bash
sk2tch dev --serve ./games/aymi
```

And that's it, you have a running application. It has Webpack and Typescript configured to Henry's needs.

To publish on itch you run:
```bash
sk2tch dev build web ./games/aymi
```

To publish on steam you run:
```bash
sk2tch build osx ./games/aymi
sk2tch build win ./games/aymi
sk2tch publish steam ./games/aymi
```

You can also have an entrypoint for server files in the config:
```tsx
const config: Sk2tchConfig = {
  ...
  server: "./server.js",
  ...
}
```

And a server boilerplate with HMR (server-side) and fast reloading (react) function can be used:
```tsx
import serverBoilerplate from "sk2tch/utils/serverBoilerplate";
// app is the express server.
// io is for socket.io, which automatically works with the client.
const { app, io } = serverBoilerplate();

// On client, use this to send messages through socket.io:
// import { socket } from "sk2tch/utils/io";
```
