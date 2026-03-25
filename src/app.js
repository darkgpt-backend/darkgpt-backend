import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found-handler.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  if (env.trustProxy) {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (env.corsOrigin === "*" || !origin) {
          callback(null, true);
          return;
        }

        const isAllowed = env.corsOrigin.includes(origin);
        callback(isAllowed ? null : new Error("CORS origin is not allowed."), isAllowed);
      },
      credentials: true
    })
  );
  app.use(express.json());
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

  app.get("/", (_request, response) => {
    response.json({
      app: "DarkGPT Backend",
      status: "ok",
      docsHint: "This backend is prepared for hosted deployment. Use /health for uptime checks."
    });
  });

  app.get("/health", (_request, response) => {
    response.send("DarkGPT backend running");
  });

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
