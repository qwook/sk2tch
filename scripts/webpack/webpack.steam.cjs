const { merge } = require("webpack-merge");
const common = require("./webpack.common.cjs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");
const path = require("path");
const sk2tchConfig = JSON.parse(process.env["SK2TCH_CONFIG"]);

const depotTargetFolders = {
  osx: ".\\universal\\mac-universal\\*",
  win: ".\\x64\\win-unpacked\\*",
};

module.exports = {
  entry: {},
  output: {},
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, "../steam/*").replace(/\\/g, "/"),
          to: ({ context, absoluteFilename }) => {
            return path.join(sk2tchConfig.output, "steam", "[name][ext]");
          },
          transform(content) {
            return content
              .toString()
              .replace(
                "$__STEAM_USERNAME__",
                sk2tchConfig.releasing.steam.username
              );
          },
        },
        {
          from: path.join(__dirname, "../steam/app_build_template.vdf"),
          to: path.join(sk2tchConfig.output, "steam", "app_build.vdf"),
          transform(content) {
            return content
              .toString()
              .replace("$__STEAM_APP_ID__", sk2tchConfig.releasing.steam.appId)
              .replace(
                "$__STEAM_DEPOTS__",
                Object.values(sk2tchConfig.releasing.steam.depots)
                  .map((depotId) => `		"${depotId}" "depot_build_${depotId}.vdf"`)
                  .join("\n")
              );
          },
        },
        ...Object.keys(sk2tchConfig.releasing.steam.depots).map((target) => {
          const depotId = sk2tchConfig.releasing.steam.depots[target];
          return {
            from: path.join(__dirname, "../steam/depot_build_template.vdf"),
            to: path.join(
              sk2tchConfig.output,
              "steam",
              `depot_build_${depotId}.vdf`
            ),
            transform(content) {
              return content
                .toString()
                .replace("$__STEAM_DEPOT_ID__", depotId)
                .replace("$__STEAM_DEPOT_PATH__", depotTargetFolders[target]);
            },
          };
        }),
      ],
    }),
  ],
};
