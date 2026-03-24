import { Router } from "express";
import { pluginController } from "../controllers/plugin.controller";

const router = Router();

// Endpoints for Users to "Plug-In" external accounts
router.post("/google/connect", pluginController.getGoogleAuth);
router.get("/google/callback", pluginController.handleGoogleCallback);

export default router;
