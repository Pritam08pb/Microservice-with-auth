import { Router } from "express";
import { agentController } from "../controllers/agent.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// Endpoint for the UI to submit a new Task Request
router.post("/task", requireAuth, agentController.submitTask);

export default router;
