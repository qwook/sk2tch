const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.cjs");
const ZipPlugin = require("zip-webpack-plugin");
const sk2tchConfig = JSON.parse(process.env["SK2TCH_CONFIG"]);

module.exports = merge(common, {
  output: {
    path: path.resolve(sk2tchConfig.output, "app/client"),
    filename: "[name].js",
  },
  devtool: "source-map",
});
