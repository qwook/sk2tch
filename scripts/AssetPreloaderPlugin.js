/**
 * AssetPreloaderPlugin for webpack.
 *
 * Injects a file into the game that attempts to preload game resources,
 * all while the game is being played.
 *
 * Helps cut out any "loading" menu.
 */

// TODO: Can we figure out how to bundle this instead?

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

const templatePath = path.resolve(__dirname, "preloader.js");
const preloader = fs.readFileSync(templatePath, "utf8");

class AssetPreloaderPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("InjectAssetsPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "InjectAssetsPlugin",
          stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
          additionalAssets: true,
        },
        (assets) => {
          let assetImports = [];

          compilation.modules.forEach((module) => {
            if (module.type === "asset/resource") {
              assetImports.push(
                `QueueToLoad("./${module.buildInfo.filename}");`
              );
            }
          });

          // The generated code to inject into the bundle
          const injectedCode = `
            ${preloader}
            ${assetImports.join("\n")}
          `;

          if (compilation.getAsset("assets.js")) {
            compilation.updateAsset(
              "assets.js",
              new webpack.sources.CachedSource(
                new webpack.sources.RawSource(injectedCode, false)
              ),
              {}
            );
          }

          if (!compilation.getAsset("assets.js")) {
            compilation.emitAsset(
              "assets.js",
              new webpack.sources.CachedSource(
                new webpack.sources.RawSource(injectedCode, false)
              )
            );
          }
        }
      );
    });
  }
}

module.exports = AssetPreloaderPlugin;
