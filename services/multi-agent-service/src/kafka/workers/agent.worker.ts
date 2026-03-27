import { getKafkaConsumer } from "../kafka.client";
import { logger } from "../../utils/logger";
import { getIo } from "../../sockets/socket.manager";
import { MultiAgentBrain } from "../../agents/core.agent";
import { conversationService } from "../../services/conversation.service";

export const startAgentWorker = async () => {
  const consumer = getKafkaConsumer();
  if (!consumer) {
    logger.error("Cannot start Agent Worker: Kafka Consumer is offline.");
    return;
  }

  logger.info("🤖 Agent Worker Daemon spinning up to listen for tasks...");

  await consumer.run({
    partitionsConsumedConcurrently: 5, // Process 5 users in parallel
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      const payload = JSON.parse(message.value.toString());
      const { messageId, userId, prompt, conversationId, conversationHistory } =
        payload;

      logger.info(`[Worker] Received Task ${messageId} from User ${userId}`);

      try {
        const io = getIo();
        const room = `agent_${userId}`;

        // 1. Notify UI that agent picked up the task
        io.to(room).emit("agent_status", { status: "thinking", messageId });
        io.to(room).emit(
          "agent_stream",
          `🧠 Analyzing complex request using LangGraph core: "${prompt}"...`,
        );

        // Execute the StateGraph Brain!
        const resultState = await MultiAgentBrain.invoke({
          userId,
          taskPrompt: prompt,
          conversationHistory: conversationHistory?.messages || [],
        });

        io.to(room).emit(
          "agent_stream",
          `⚡ Execution finalized via ${resultState.routingDecision} topology.`,
        );

        // Save assistant response to conversation
        if (conversationId) {
          await conversationService.addMessage(
            conversationId,
            "assistant",
            resultState.finalDraft,
            resultState.routingDecision,
          );
        }

        // Final payload delivery
        io.to(room).emit("agent_complete", {
          messageId,
          result: resultState.finalDraft,
          conversationId,
        });
      } catch (error: any) {
        logger.error(`[Worker] Failed to process task ${messageId}`, error);

        // Save error message to conversation
        if (conversationId) {
          await conversationService.addMessage(
            conversationId,
            "assistant",
            `Error: ${error.message || "Critical Reasoning Failure"}`,
            "ERROR",
          );
        }

        getIo()
          .to(`agent_${userId}`)
          .emit("agent_error", {
            messageId,
            error: error.message || "Critical Reasoning Failure",
          });
      }
    },
  });
};
