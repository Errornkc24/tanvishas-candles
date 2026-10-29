import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: "Invalid request", details: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  const status = message === "Authentication required" || message.includes("invalid or expired") ? 401
    : message === "Order not found" ? 404
      : 400;
  if (status === 400) console.error("API request failed:", error);
  res.status(status).json({ error: message });
};
