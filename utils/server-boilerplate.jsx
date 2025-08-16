import historyApiFallback from "connect-history-api-fallback";
import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

export default function serverBoilerplate(defaultPort, defer) {
  const app = express();

  // Create an HTTP server and attach Express to it
  const server = createServer(app);

  // Attach socket.io to the HTTP server
  const io = new SocketIOServer(server);

  const use = () => {
    if (process.env.NODE_ENV === "development") {
      const webpack = require("webpack");
      const webpackConfig = require("sk2tch/scripts/webpack/webpack.common.cjs");
      const middleware = require("webpack-dev-middleware");
      const hotMiddleware = require("webpack-hot-middleware");

      const compiler = webpack(webpackConfig);

      app.use(
        middleware(compiler, {
          stats: {
            colors: true,
          },
        })
      );
      app.use(hotMiddleware(compiler));
    } else {
      app.use(express.static("client"));
    }
  };

  if (!defer) {
    use();
  }

  const port = process.env.PORT || defaultPort || 9000;
  server.listen(port, () => console.log(`App listening on port ${port}!`));

  return { app, io, use };
}
