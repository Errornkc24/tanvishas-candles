import cors from "cors";
import express, { type RequestHandler } from "express";
import * as rateLimitModule from "express-rate-limit";
import * as helmetModule from "helmet";
import { corsOrigins } from "./config/env.js";
import { databaseRoutes, paymentRoutes, salesRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { authRoutes } from "./modules/auth/auth.routes.js";

const helmet = (helmetModule as unknown as {
  default: () => RequestHandler;
}).default;

const rateLimit = (rateLimitModule as unknown as {
  default: (options: {
    windowMs: number;
    limit: number;
    standardHeaders: "draft-7";
    legacyHeaders: false;
  }) => RequestHandler;
}).default;

export const app = express();
export default app;

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: corsOrigins, allowedHeaders: ["authorization", "content-type", "apikey", "x-client-info", "prefer", "range", "range-unit", "accept-profile", "content-profile"], exposedHeaders: ["content-range", "preference-applied", "range-unit"], methods: ["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"] }));
app.use("/api/database", databaseRoutes);
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/payments", rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: "draft-7", legacyHeaders: false }));
app.use("/api/payments", paymentRoutes);
app.use("/api/sales", salesRoutes);

app.use(errorHandler);
