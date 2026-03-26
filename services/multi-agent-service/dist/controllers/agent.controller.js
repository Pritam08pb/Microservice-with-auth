"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentController = exports.AgentController = void 0;
const agent_service_1 = require("../services/agent.service");
class AgentController {
    async submitTask(req, res) {
        const userId = req.user?.id;
        const { prompt } = req.body;
        // Validate request contract
        if (!userId || !prompt) {
            res.status(400).json({ error: "Missing required contract fields: prompt" });
            return;
        }
        try {
            const messageId = await agent_service_1.agentService.queueAgentTask(userId, prompt);
            res.status(202).json({
                message: "Thought accepted and queued for Agentic Processing.",
                taskId: messageId,
                status: "queued"
            });
        }
        catch (err) {
            res.status(503).json({ error: "Service Unavailable: Event Queue Exhausted or Offline." });
        }
    }
}
exports.AgentController = AgentController;
exports.agentController = new AgentController();
//# sourceMappingURL=agent.controller.js.map