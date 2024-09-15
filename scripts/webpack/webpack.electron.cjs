const { merge } = require("webpack-merge");
const common = require("./webpack.common.cjs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");
const path = require("path");
const sk2tchConfig = JSON.parse(process.env["SK2TCH_CONFIG"]);

console.log(sk2tchConfig.entry);

module.exports = merge(common, {
  output: {
    path: path.join(sk2tchConfig.output, "electron", "game"),
    filename: "[name].js",
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, "../electron/*"),
          to: ({ context, absoluteFilename }) => {
            return path.join(sk2tchConfig.output, "electron", "[name][ext]");
          },
        },
      ],
      // patterns: assets.map((asset) => ({
      //   from: path.join("./public", asset),
      //   to: asset,
      //   force: true,
      // })),
    }),
  ],
});
