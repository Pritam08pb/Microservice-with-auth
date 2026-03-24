import { Router } from "express";
import agentRoutes from "./agent.routes";
import pluginRoutes from "./plugin.routes";
import documentRoutes from "./document.routes";
import authRoutes from "./auth.routes";
import configRoutes from "./config.routes";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "Agent Service Online", timestamp: new Date().toISOString() });
});

// Primary Webhooks processing
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/config", configRoutes);
router.use("/api/v1/agents", agentRoutes);
router.use("/api/v1/plugins", pluginRoutes);
router.use("/api/v1/documents", documentRoutes);

export default router;