#!/usr/bin/env ts-node

import { Sk2tchConfig } from "./sk2tch.config";

const path = require("path");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const shell = require("shelljs");
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

      let webpack;
      const cwd = path.resolve(__dirname, "..");
      if (config.server) {
        webpack = spawn("npx", ["tsx", "serve", config.server], {
          cwd,
          env: { ...process.env, ...env },
          stdio: ["inherit", "pipe", "pipe"],
        });
      } else {
        webpack = spawn(
          "npx",
          ["webpack", "--color", "serve", "--config", webpackPath],
          {
            cwd,
            env: { ...process.env, ...env },
            stdio: ["inherit", "pipe", "pipe"],
          }
        );
      }
      if (!config.server) {
        webpack.stdout.on("data", (data) => {
          process.stdout.write(data);
        });
        webpack.stderr.on("data", (data) => {
          process.stderr.write(data);
        });
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
      console.error("Not implemented!");
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
        const webpack = spawn(
          "npx",
          ["webpack", "--color", "--config", webpackPath],
          {
            env: { ...process.env, ...env },
            stdio: ["inherit", "pipe", "pipe"],
          }
        );
        webpack.stdout.on("data", (data) => {
          process.stdout.write(data);
        });
        webpack.stderr.on("data", (data) => {
          process.stderr.write(data);
        });
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
