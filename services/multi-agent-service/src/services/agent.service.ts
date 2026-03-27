import { publishAgentTask } from "../kafka/kafka.client";
import { logger } from "../utils/logger";

export class AgentService {
  /**
   * Dispatches a user thought context to the background Kafka orchestration queue.
   */
  public async queueAgentTask(
    userId: string,
    prompt: string,
    conversationId?: string,
    conversationHistory?: any,
  ): Promise<string> {
    try {
      const messageId = await publishAgentTask(
        userId,
        prompt,
        conversationId,
        conversationHistory,
      );
      logger.info(
        `[Agent Service] Successfully queued task ${messageId} for user ${userId}.`,
      );
      return messageId;
    } catch (error) {
      logger.error(
        `[Agent Service] Fatal error queuing task to Kafka broker.`,
        error,
      );
      throw new Error("Message Broker Offline");
    }
  }
}

export const agentService = new AgentService();
