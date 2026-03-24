import { Request, Response } from "express";
import { agentService } from "../services/agent.service";

export class AgentController {
  
  public async submitTask(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { prompt } = req.body;
    
    // Validate request contract
    if (!userId || !prompt) {
      res.status(400).json({ error: "Missing required contract fields: prompt" });
      return;
    }

    try {
      const messageId = await agentService.queueAgentTask(userId, prompt);
      
      res.status(202).json({
        message: "Thought accepted and queued for Agentic Processing.",
        taskId: messageId,
        status: "queued"
      });
    } catch (err: any) {
      res.status(503).json({ error: "Service Unavailable: Event Queue Exhausted or Offline." });
    }
  }
}

export const agentController = new AgentController();
