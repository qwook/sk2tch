const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const assets = require("./assets.json");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const ReactRefreshTypeScript = require("react-refresh-typescript");
const AssetPreloaderPlugin = require("../AssetPreloaderPlugin");
const TerserPlugin = require("terser-webpack-plugin");
const { HotModuleReplacementPlugin } = require("webpack");
const fs = require("fs");

const { DefinePlugin, ProvidePlugin } = webpack;

const sk2tchConfig = JSON.parse(process.env["SK2TCH_CONFIG"]);

let webpackHotMiddleware = "webpack-hot-middleware/client";

let pages = {};

Object.keys(sk2tchConfig.pages || {}).forEach(
  (name) =>
    (pages[name] = [
      sk2tchConfig.pages[name],
      ...(process.env.NODE_ENV === "development" ? [webpackHotMiddleware] : []),
    ])
);

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    bundle: [
      sk2tchConfig.entry,
      ...(process.env.NODE_ENV === "development" ? [webpackHotMiddleware] : []),
    ], //, webpackHotMiddleware + "?name=bundle"],
    ...pages,
  }, // Change this to your main TypeScript file
  ...(process.env.NODE_ENV === "development"
    ? { devtool: "inline-source-map" }
    : {}),
  output: {
    path: path.join(sk2tchConfig.output, "game"),
    filename: "[name].js",
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        // Separate React-related libraries
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "react",
          chunks: "all",
          priority: 20, // High priority for React chunk
        },
        // Separate Three.js
        three: {
          test: /[\\/]node_modules[\\/]three[\\/]/,
          name: "three",
          chunks: "all",
          priority: 20, // High priority for Three.js chunk
        },
        // Separate Sk2tch.js
        sk2tch: {
          test: /[\\/]src[\\/]sk2tch[\\/]/,
          name: "sk2tch",
          chunks: "all",
          priority: 20, // High priority for Sk2tch chunk
        },
        // Create a chunk for all other node_modules
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          priority: 10, // Lower priority than React and Three.js
          reuseExistingChunk: true, // Reuse chunks if they are already split out
        },
      },
    },
    ...(process.env.NODE_ENV === "production"
      ? {
          minimize: true, // Enable minification (enabled by default in 'production' mode)
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true, // Remove console logs
                },
                output: {
                  comments: false, // Remove comments
                },
              },
            }),
          ],
        }
      : {}),
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
        test: /\.(png|jpg|jpeg|gif|svg|mp3|mp4|webm|ttf|otf|jsonc|gltf|glb|obj)$/, // Images
        type: "asset/resource", // For Webpack 5+
      },
      {
        test: /\.(frag|vert|txt)$/i,
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
    new AssetPreloaderPlugin(),
    new webpack.IgnorePlugin({
      resourceRegExp: /\.git/,
    }),
    new DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        TARGET: JSON.stringify(process.env.TARGET),
        DEBUG: JSON.stringify(process.env.DEBUG),
        GTAG: JSON.stringify(sk2tchConfig.analytics?.googleTag || ""),
      },
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../../index.html"),
      chunks: ["bundle"],
    }),
    ...Object.keys(sk2tchConfig.pages || {}).map(
      (name) =>
        new HtmlWebpackPlugin({
          filename: `${name}/index.html`,
          template: path.resolve(__dirname, "../../index.html"),
          chunks: [name],
        })
    ),
    ...(process.env.NODE_ENV === "development"
      ? [
          new ReactRefreshWebpackPlugin(),
          sk2tchConfig.server && new HotModuleReplacementPlugin(),
        ]
      : []
    ).filter((plugin) => !!plugin),
  ],
  ...(process.env.NODE_ENV === "development"
    ? {
        devServer: {
          port: 9000,
          hot: true,
          static: {
            directory: path.join(__dirname, "public_"),
          },
        },
      }
    : {}),
};
