const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const assets = require("./assets.json");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const ReactRefreshTypeScript = require("react-refresh-typescript");
const TerserPlugin = require("terser-webpack-plugin");
const fs = require("fs");
const nodeExternals = require("webpack-node-externals");

const { DefinePlugin, ProvidePlugin } = webpack;

const sk2tchConfig = JSON.parse(process.env["SK2TCH_CONFIG"]);

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    server: [sk2tchConfig.server], //, webpackHotMiddleware + "?name=bundle"],
  }, // Change this to your main TypeScript file
  devtool: "inline-source-map",
  target: "node",
  externals: [
    nodeExternals({
      allowlist: [/^sk2tch/],
    }),
  ],
  output: {
    path: path.join(sk2tchConfig.output, "app"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/, // Add TypeScript file extensions
        exclude: (filePath) => {
          // Exclude all node_modules except for the 'sk2tch' module
          return (
            /node_modules/.test(filePath) &&
            !/node_modules\/sk2tch/.test(filePath)
          );
        },
        use: {
          loader: "ts-loader", // Use ts-loader for TypeScript files
          options: {
            getCustomTransformers: () => ({
              before:
                process.env.NODE_ENV === "development"
                  ? [ReactRefreshTypeScript()]
                  : [],
            }),
            transpileOnly: true,
            configFile: "tsconfig.json",
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader", // Compiles SCSS to CSS
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|mp3|mp4|webm|ttf|otf|jsonc)$/, // Images
        type: "asset/resource", // For Webpack 5+
      },
      {
        test: /\.(frag|vert)$/i,
        use: "raw-loader",
      },
    ],
  },
  resolve: {
    modules: [path.resolve(__dirname, "node_modules"), "node_modules"],
    extensions: [".ts", ".tsx", ".js", ".jsx"], // Add TypeScript file extensions
    fallback: {
      stream: require.resolve("stream-browserify"),
    },
  },
  plugins: [
    new ProvidePlugin({
      React: "react",
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /\.git/,
    }),
    new DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        TARGET: JSON.stringify(process.env.TARGET),
        DEBUG: JSON.stringify(process.env.DEBUG),
      },
    }),
  ],
};
