#!/usr/bin/env ts-node

const path = require("path");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const shell = require("shelljs");

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
      const configPath = path.join(resolvedPath, "sk2tch.config.ts");
      const { default: config } = await import(configPath);

      const webpackPath = path.join(
        __dirname,
        "../scripts/webpack/webpack.config.cjs"
      );

      config.entry = path.join(resolvedPath, config.entry);

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
    "build [target]",
    "Build the project for a specific target (web, osx, win)",
    (yargs) => {
      return yargs.positional("target", {
        describe: "The build target (web, osx, win)",
        choices: ["web", "osx", "win"],
        demandOption: true,
      });
    },
    (argv) => {
      console.log(`Building for ${argv.target}...`);
      console.error("Not implemented!");
      // Add your build logic for web, osx, or win here
    }
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
