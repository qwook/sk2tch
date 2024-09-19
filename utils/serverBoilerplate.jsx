import webpack from "webpack";
import middleware from "webpack-dev-middleware";
import hotMiddleware from "webpack-hot-middleware";
import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import webpackConfig from "sk2tch/scripts/webpack/webpack.common.cjs";

export default function serverBoilerplate(defaultPort) {
  const compiler = webpack(webpackConfig);
  const app = express();

  // Create an HTTP server and attach Express to it
  const server = createServer(app);

  // Attach socket.io to the HTTP server
  const io = new SocketIOServer(server);

  app.use(
    middleware(compiler, {
      stats: {
        colors: true,
      },
    })
  );
  app.use(hotMiddleware(compiler));

  const port = process.env.PORT || defaultPort || 9000;
  server.listen(port, () => console.log(`App listening on port ${port}!`));

  return { app, io };
}
