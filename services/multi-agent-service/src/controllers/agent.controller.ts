import { Request, Response } from "express";
import { agentService } from "../services/agent.service";
import { conversationService } from "../services/conversation.service";

export class AgentController {
  public async submitTask(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { prompt, conversationId } = req.body;

    // Validate request contract
    if (!userId || !prompt) {
      res
        .status(400)
        .json({ error: "Missing required contract fields: prompt" });
      return;
    }

    try {
      // Get or create active conversation
      const activeConversationId =
        conversationId ||
        (await conversationService.getOrCreateActiveConversation(userId));

      // Add user message to conversation
      await conversationService.addMessage(
        activeConversationId,
        "user",
        prompt,
      );

      // Get conversation history for context
      const conversationHistory =
        await conversationService.getConversationHistory(
          activeConversationId,
          20,
        );

      const messageId = await agentService.queueAgentTask(
        userId,
        prompt,
        activeConversationId,
        conversationHistory,
      );

      res.status(202).json({
        message: "Thought accepted and queued for Agentic Processing.",
        taskId: messageId,
        conversationId: activeConversationId,
        status: "queued",
      });
    } catch (err: any) {
      res.status(503).json({
        error: "Service Unavailable: Event Queue Exhausted or Offline.",
      });
    }
  }

  public async getConversations(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const conversations =
        await conversationService.getUserConversations(userId);
      res.json({ conversations });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  }

  public async getConversation(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!conversationId) {
      res.status(400).json({ error: "Conversation ID required" });
      return;
    }

    try {
      const conversation = await conversationService.getConversationHistory(
        conversationId as string,
      );

      // Verify the conversation belongs to the user
      if (conversation.userId !== userId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      res.json({ conversation });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  }
}

export const agentController = new AgentController();
