const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const assets = require("./assets.json");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const ReactRefreshTypeScript = require("react-refresh-typescript");
const AssetPreloaderPlugin = require("../AssetPreloaderPlugin");

const { DefinePlugin, ProvidePlugin } = webpack;

const sk2tchConfig = JSON.parse(process.env["SK2TCH_CONFIG"]);

module.exports = {
  mode: process.env.NODE_ENV,
  entry: { bundle: sk2tchConfig.entry }, // Change this to your main TypeScript file
  devtool: "inline-source-map",
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
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/, // Add TypeScript file extensions
        exclude: /node_modules/,
        use: {
          loader: "ts-loader", // Use ts-loader for TypeScript files
          options: {
            getCustomTransformers: () => ({
              before: [ReactRefreshTypeScript()],
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
        test: /\.(png|jpg|jpeg|gif|svg|mp4|ttf|otf|jsonc)$/, // Images
        type: "asset/resource", // For Webpack 5+
      },
      {
        test: /\.(frag|vert)$/i,
        use: "raw-loader",
      },
    ],
  },
  resolve: {
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
        GTAG: JSON.stringify(sk2tchConfig.analytics.googleTag),
      },
    }),
    new HtmlWebpackPlugin({
      template: "./src/sk2tch/index.html",
    }),
    new ReactRefreshWebpackPlugin(),
    // ...(process.env.NODE_ENV === "production"
    //   ? [
    //       new CopyWebpackPlugin({
    //         patterns: assets.map((asset) => ({
    //           from: path.join("./public", asset),
    //           to: asset,
    //           force: true,
    //         })),
    //       }),
    //       new ZipPlugin({
    //         path: "../zip",
    //         filename: "release.zip",
    //       }),
    //     ]
    //   : []),
  ],
  devServer: {
    port: 9000,
    hot: true,
    static: {
      directory: path.join(__dirname, "public_"),
    },
  },
};
