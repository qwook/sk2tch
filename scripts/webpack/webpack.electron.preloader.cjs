const {
  merge
} = require("webpack-merge");
const common = require("./webpack.common.cjs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");
const path = require("path");
const sk2tchConfig = JSON.parse(process.env["SK2TCH_CONFIG"]);

module.exports = merge(common, {
  /**
   TODO: These were added so that the monitor code would work.
   But this will probably break sk2tch build.
   Need to clone this file and make it an additional step for compiling the
   preloader.
   */
  entry: {
    preload: sk2tchConfig.electron ? [
      sk2tchConfig.electron,
    ] : [],
  },
  output: {
    // path: path.join(sk2tchConfig.output, "electron", "package", "game"),
    path: path.join(sk2tchConfig.output, "electron", "package"),
    filename: "[name].js",
  },
  target: "node",
  node: {
    __dirname: false,
  },
  module: {
    rules: [{
      test: /\.node$/,
      loader: "node-loader",
    }, ],
  },
});