import express from "express";
import cors from "cors";
import requirementRoutes from "./routes/requirements.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  const origins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  // No allowlist configured means allow all origins (handy for local dev).
  app.use(cors({ origin: origins.length ? origins : true }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/requirements", requirementRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
