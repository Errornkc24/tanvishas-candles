import { Router } from "express";
import { requireAuth } from "../../middleware/require-auth.js";

export const authRoutes = Router();

authRoutes.get("/session", requireAuth, (req, res) => {
  res.json({ expiresAt: req.sessionExpiresAt });
});
