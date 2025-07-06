const {
  merge
} = require("webpack-merge");
const common = require("./webpack.common.cjs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");
const path = require("path");
const sk2tchConfig = JSON.parse(process.env["SK2TCH_CONFIG"]);

module.exports = merge(common, {
  output: {
    path: path.join(sk2tchConfig.output, "electron", "package", "game"),
    filename: "[name].js",
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{
          from: path.join(__dirname, "../electron/*").replace(/\\/g, "/"),
          to: ({
            context,
            absoluteFilename
          }) => {
            return path.join(
              sk2tchConfig.output,
              "electron/package",
              "[name][ext]"
            );
          },
          transform(content) {
            return content
              .toString()
              .replace(/\$__APP_ID__/g, sk2tchConfig.releasing.appId)
              .replace(/\$__APP_PRODUCT_NAME__/g, sk2tchConfig.name)
              .replace(/\$__APP_CODE__/g, sk2tchConfig.code)
              .replace(/\$__KIOSK__/g, sk2tchConfig.kiosk ? "true" : "false");
          },
        },
        ...(sk2tchConfig.icon ?
          [{
            from: sk2tchConfig.icon,
            to: path.join(sk2tchConfig.output, "electron/package/icon.png"),
          }, ] :
          []),
      ],
    }),
  ],
});