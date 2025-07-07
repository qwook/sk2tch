#!/usr/bin/env ts-node

import { existsSync, fstat } from "fs";
import { Sk2tchConfig } from "./sk2tch.config";
import { ChildProcess, exec } from "child_process";

const path = require("path");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const { spawn } = require("child_process");

const env = {};

async function getConfig(
  relativePath: string,
  configPath: string
): Promise<Sk2tchConfig> {
  const { default: config } = await import(configPath);
  config.entry = path.join(relativePath, config.entry);
  config.electron = path.join(relativePath, config.electron);
  config.output = path.join(relativePath, config.output);
  config.icon = config.icon && path.join(relativePath, config.icon);
  config.server = config.server && path.join(relativePath, config.server);

  if (config.pages) {
    for (const name in config.pages) {
      config.pages[name] = path.join(relativePath, config.pages[name]);
    }
  }
  return config;
}

function spawnForwardConsole(command, args, options): ChildProcess {
  const { env, ...otherOptions } = options;

  const childProcess = spawn(command, args, {
    stdio: ["inherit", "pipe", "pipe"],
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
    ...otherOptions,
  });

  childProcess.stdout.on("data", (data) => {
    process.stdout.write(data);
  });

  childProcess.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  childProcess.on("close", (code) => {
    console.log(`Child process exited with code ${code}`);
  });

  childProcess.on("error", (err) => {
    console.error("Failed to start child process:", err);
  });

  return childProcess;
}

async function spawnAsync(
  command,
  args,
  options: { env?: any; [key: string]: any } = {}
): Promise<any> {
  console.log(
    `${command} ${args.map((str) => str.replace(/ /g, "\\ ")).join(" ")}`
  );
  return new Promise((resolve, reject) => {
    const childProcess = spawnForwardConsole(command, args, options);

    let stdout = "";

    childProcess.stdout.on("data", (data) => {
      stdout += data;
    });

    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve({ code, stdout });
      } else {
        reject(new Error(`Child process exited with code ${code}`));
      }
    });

    childProcess.on("error", (err) => {
      reject(err);
    });
  });
}

// Define your commands
yargs(hideBin(process.argv))
  .command(
    "dev [path]",
    "Start the development server",
    (yargs) => {
      yargs.boolean("serve", {
        describe: "To host on a local server.",
        default: false,
        type: "boolean",
      });
      yargs.positional("path", {
        describe: "The path to start the dev server in",
        default: ".",
        type: "string",
      });
    },
    async (argv) => {
      const resolvedPath = path.resolve(argv.path as string);

      // Try to find the sk2tch config file.
      const config = await getConfig(
        resolvedPath,
        path.join(resolvedPath, "sk2tch.config.ts")
      );

      const webpackPath = path.join(
        __dirname,
        "../scripts/webpack/webpack.common.cjs"
      );

      console.log("Starting development server...");
      env["SK2TCH_CONFIG"] = JSON.stringify(config);
      env["NODE_ENV"] = "development";

      const cwd = path.resolve(__dirname, "..");
      if (config.server && argv.serve) {
        await spawnAsync("npx", ["tsx", config.server], {
          cwd,
          env: { ...process.env, ...env },
        });
      } else if (argv.serve) {
        await spawnAsync(
          "npx",
          ["webpack", "--color", "serve", "--config", webpackPath],
          {
            cwd,
            env: { ...process.env, ...env },
          }
        );
      } else {
        await spawnAsync(
          "npx",
          ["webpack", "--color", "--config", webpackPath],
          {
            cwd,
            env: { ...process.env, ...env },
          }
        );
      }
    }
  )
  .command(
    "electron [path]",
    "Run the electron app in development mode.",
    (yargs) => {
      yargs.positional("path", {
        describe: "The path to start the dev server in",
        default: ".",
        type: "string",
      });
    },
    async (argv) => {
      const resolvedPath = path.resolve(argv.path as string);

      // Try to find the sk2tch config file.
      const config = await getConfig(
        resolvedPath,
        path.join(resolvedPath, "sk2tch.config.ts")
      );

      env["SK2TCH_CONFIG"] = JSON.stringify(config);
      env["NODE_ENV"] = "development";

      let webpackTargetPaths = [""];
      webpackTargetPaths = [
        "../scripts/webpack/webpack.electron.cjs",
        "../scripts/webpack/webpack.electron.preloader.cjs",
      ];

      const cwd = path.resolve(__dirname, "..");

      for (const webpackTargetPath of webpackTargetPaths) {
        const webpackPath = path.join(__dirname, webpackTargetPath);

        console.log(`Building: ${webpackTargetPath}`);
        await spawnAsync(
          "npx",
          ["webpack", "--color", "--config", webpackPath],
          {
            cwd,
            env: { ...process.env, ...env },
          }
        );
      }

      const webpackPath = path.join(
        __dirname,
        "../scripts/webpack/webpack.common.cjs"
      );

      let devServer = spawnForwardConsole(
        "npx",
        ["webpack", "--color", "serve", "--config", webpackPath],
        {
          cwd,
          env: { ...process.env, ...env },
        }
      );

      await spawnAsync("npm", ["install", "."], {
        env: { ...process.env, ...env },
        cwd: path.join(resolvedPath, "dist/electron/package"),
      });

      await spawnAsync("npx", ["electron", "."], {
        env: { ...process.env, ...env },
        cwd: path.join(resolvedPath, "dist/electron/package"),
      });

      devServer.kill("SIGTERM");
    }
  )
  .command(
    "build [target] [path]",
    "Build the project for a specific target (web, osx, win)",
    (yargs) => {
      yargs
        .positional("target", {
          describe: "The build target (web, osx, win)",
          choices: ["web", "osx", "osx-signed", "win", "app"],
          demandOption: true,
        })
        .positional("path", {
          describe: "The path to start the dev server in",
          default: ".",
          type: "string",
        });
    },
    async (argv) => {
      console.log(`Building for ${argv.target}...`);
      const resolvedPath = path.resolve(argv.path as string);

      // Try to find the sk2tch config file.
      const config = await getConfig(
        resolvedPath,
        path.join(resolvedPath, "sk2tch.config.ts")
      );

      env["SK2TCH_CONFIG"] = JSON.stringify(config);
      env["NODE_ENV"] = "production";

      let webpackTargetPaths = [""];
      if (
        argv.target === "osx" ||
        argv.target === "osx-signed" ||
        argv.target === "win"
      ) {
        webpackTargetPaths = [
          "../scripts/webpack/webpack.electron.cjs",
          "../scripts/webpack/webpack.electron.preloader.cjs",
        ];
        env["TARGET"] = "electron";
      } else if (argv.target === "web") {
        webpackTargetPaths = ["../scripts/webpack/webpack.web.cjs"];
      } else if (argv.target === "app") {
        webpackTargetPaths = [
          "../scripts/webpack/webpack.app.client.cjs",
          "../scripts/webpack/webpack.app.server.cjs",
        ];
      }

      for (const webpackTargetPath of webpackTargetPaths) {
        const webpackPath = path.join(__dirname, webpackTargetPath);

        console.log(`Building: ${webpackTargetPath}`);
        await spawnAsync(
          "npx",
          ["webpack", "--color", "--config", webpackPath],
          {
            env: { ...process.env, ...env },
          }
        );
      }

      if (
        argv.target === "osx" ||
        argv.target === "osx-signed" ||
        argv.target === "win"
      ) {
        console.log(`Creating electron app.`);

        await spawnAsync("npm", ["install"], {
          cwd: path.join(resolvedPath, "dist/electron/package"),
          env: { ...process.env, ...env },
        });

        const electronArgs = [
          "electron-builder",
          "--project",
          path.join(resolvedPath, "dist/electron/package"),
        ];

        if (argv.target === "osx") {
          electronArgs.push(
            "--config",
            path.join(
              resolvedPath,
              "dist/electron/package/electron-builder-dev.json"
            )
          );
          electronArgs.push("--mac", "--universal");
        } else if (argv.target === "osx-signed") {
          env["APPLE_API_KEY"] = config.releasing.osx.appleApiKey;
          env["APPLE_API_KEY_ID"] = config.releasing.osx.appleApiKeyId;
          env["APPLE_API_ISSUER"] = config.releasing.osx.appleApiIssuer;
          electronArgs.push(
            "--config",
            path.join(
              resolvedPath,
              "dist/electron/package/electron-builder.json"
            )
          );
          electronArgs.push("--mac", "--universal");
        } else if (argv.target === "win") {
          electronArgs.push(
            "--config",
            path.join(
              resolvedPath,
              "dist/electron/package/electron-builder.json"
            )
          );
          electronArgs.push("--win", "portable", "--x64");
        }

        await spawnAsync("npx", electronArgs, {
          env: { ...process.env, ...env },
        });
      }
    }
  )
  .command(
    "publish [platform] [path]",
    "Publish the project to a platform (itch, steam)",
    (yargs) => {
      return yargs
        .positional("platform", {
          describe: "The platform to publish to (itch, steam)",
          choices: ["itch", "steam"],
          demandOption: true,
        })
        .positional("path", {
          describe: "The path to start the dev server in",
          default: ".",
          type: "string",
        });
    },
    async (argv) => {
      if (argv.platform === "steam") {
        const resolvedPath = path.resolve(argv.path as string);

        // Try to find the sk2tch config file.
        const config = await getConfig(
          resolvedPath,
          path.join(resolvedPath, "sk2tch.config.ts")
        );

        const webpackPath = path.join(
          __dirname,
          "../scripts/webpack/webpack.steam.cjs"
        );

        console.log("Copying steam files...");
        env["SK2TCH_CONFIG"] = JSON.stringify(config);
        env["NODE_ENV"] = "production";

        const cwd = path.resolve(__dirname, "..");
        await spawnAsync(
          "npx",
          ["webpack", "--color", "--config", webpackPath],
          {
            cwd,
            env: { ...process.env, ...env },
          }
        );

        if (process.platform === "win32") {
          await spawnAsync(
            path.join(__dirname, "../scripts/steamcmd/steamcmd.exe"),
            [
              "+login",
              config.releasing.steam.username,
              "+run_app_build",
              path.join(resolvedPath, "dist/steam/app_build.vdf"),
            ],
            {
              cwd,
              env: { ...process.env, ...env },
            }
          );
        } else {
          if (
            !existsSync(path.join(__dirname, "../scripts/steamcmd/steamcmd.sh"))
          ) {
            const { stdout, stderr } = await exec(
              'curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz" | tar zxvf -',
              {
                cwd: path.join(__dirname, "../scripts/steamcmd"),
              }
            );
          }

          await spawnAsync(
            "sh",
            [
              path.join(__dirname, "../scripts/steamcmd/steamcmd.sh"),
              "+login",
              config.releasing.steam.username,
              "+run_app_build",
              path.join(resolvedPath, "dist/steam/app_build.vdf"),
              "+quit",
            ],
            {
              cwd,
              env: { ...process.env, ...env },
            }
          );
        }
      } else {
        console.log(`Publishing to ${argv.platform}...`);
        console.error("Not implemented!");
      }
    }
  )
  .demandCommand(1, "You need to provide a valid command.")
  .help().argv;
