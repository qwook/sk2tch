#!/usr/bin/env ts-node

import { Sk2tchConfig } from "./sk2tch.config";

const path = require("path");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const shell = require("shelljs");

async function getConfig(
  relativePath: string,
  configPath: string
): Promise<Sk2tchConfig> {
  const { default: config } = await import(configPath);
  config.entry = path.join(relativePath, config.entry);
  config.output = path.join(relativePath, config.output);
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
      shell.env["SK2TCH_CONFIG"] = JSON.stringify(config);
      const webpack = shell.exec(
        `NODE_ENV=development npx webpack --color serve --config=${webpackPath}`,
        {
          async: true,
        }
      );
      webpack.stdout.on("data", (data) => {
        process.stdout.write(data);
      });
      webpack.stderr.on("data", (data) => {
        process.stderr.write(data);
      });
    }
  )
  .command(
    "build [target] [path]",
    "Build the project for a specific target (web, osx, win)",
    (yargs) => {
      yargs
        .positional("target", {
          describe: "The build target (web, osx, win)",
          choices: ["web", "osx", "win"],
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

      let webpackTargetPath = "";
      if (argv.target === "osx") {
        webpackTargetPath = "../scripts/webpack/webpack.electron.cjs";
      } else if (argv.target === "web") {
        webpackTargetPath = "../scripts/webpack/webpack.web.cjs";
      }

      const webpackPath = path.join(__dirname, webpackTargetPath);

      console.log("Starting development server...");
      shell.env["SK2TCH_CONFIG"] = JSON.stringify(config);
      const webpack = shell.exec(
        `NODE_ENV=development npx webpack --color --config=${webpackPath}`,
        {
          async: true,
        }
      );
      webpack.stdout.on("data", (data) => {
        process.stdout.write(data);
      });
      webpack.stderr.on("data", (data) => {
        process.stderr.write(data);
      });
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
