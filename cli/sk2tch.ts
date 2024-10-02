#!/usr/bin/env ts-node

import { Sk2tchConfig } from "./sk2tch.config";

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
  config.output = path.join(relativePath, config.output);
  config.server = config.server && path.join(relativePath, config.server);

  if (config.pages) {
    for (const name in config.pages) {
      config.pages[name] = path.join(relativePath, config.pages[name]);
    }
  }
  return config;
}

async function spawnAsync(
  command,
  args,
  options: { env?: any; [key: string]: any } = {}
) {
  return new Promise((resolve, reject) => {
    const { env, ...otherOptions } = options;

    const childProcess = spawn(command, args, {
      env: { ...process.env, ...env },
      stdio: ["inherit", "pipe", "pipe"],
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
      if (code === 0) {
        resolve({ code });
      } else {
        reject(new Error(`Child process exited with code ${code}`));
      }
    });

    childProcess.on("error", (err) => {
      console.error("Failed to start child process:", err);
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
      if (config.server) {
        await spawnAsync("npx", ["tsx", "serve", config.server], {
          cwd,
          env: { ...process.env, ...env },
        });
      } else {
        await spawnAsync(
          "npx",
          ["webpack", "--color", "serve", "--config", webpackPath],
          {
            cwd,
            env: { ...process.env, ...env },
          }
        );
      }
    }
  )
  .command(
    "build [target] [path]",
    "Build the project for a specific target (web, osx, win)",
    (yargs) => {
      yargs
        .positional("target", {
          describe: "The build target (web, osx, win)",
          choices: ["web", "osx", "win", "app"],
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
      if (argv.target === "osx") {
        webpackTargetPaths = ["../scripts/webpack/webpack.electron.cjs"];
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

      if (argv.target === "osx") {
        console.log(`Creating electron app.`);

        await spawnAsync("npm", ["install"], {
          cwd: path.join(resolvedPath, "dist/electron"),
          env: { ...process.env, ...env },
        });

        await spawnAsync(
          "npx",
          [
            "electron-builder",
            "--project",
            path.join(resolvedPath, "dist/electron"),
            "--config",
            path.join(__dirname, "../scripts/electron-builder-dev.json"),
            "--mac",
            "--universal",
          ],
          {
            env: { ...process.env, ...env },
          }
        );
      }
    }
    // Add your build logic for web, osx, or win here
  )
  .command(
    "publish [platform]",
    "Publish the project to a platform (itch, steam)",
    (yargs) => {
      return yargs.positional("platform", {
        describe: "The platform to publish to (itch, steam)",
        choices: ["itch", "steam"],
        demandOption: true,
      });
    },
    (argv) => {
      console.log(`Publishing to ${argv.platform}...`);
      console.error("Not implemented!");
      // Add your publish logic for itch or steam here
    }
  )
  .demandCommand(1, "You need to provide a valid command.")
  .help().argv;
