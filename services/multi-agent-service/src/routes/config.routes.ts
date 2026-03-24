import { Router } from "express";
import { configController } from "../controllers/config.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.put("/", requireAuth, configController.updateConfig);
router.get("/", requireAuth, configController.getConfig);

export default router;
