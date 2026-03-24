import { getKafkaConsumer } from "../kafka.client";
import { logger } from "../../utils/logger";
import { getIo } from "../../sockets/socket.manager";
import { MultiAgentBrain } from "../../agents/core.agent";

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
      const { messageId, userId, prompt } = payload;

      logger.info(`[Worker] Received Task ${messageId} from User ${userId}`);

      try {
        const io = getIo();
        const room = `agent_${userId}`;

        // 1. Notify UI that agent picked up the task
        io.to(room).emit("agent_status", { status: "thinking", messageId });
        io.to(room).emit("agent_stream", `🧠 Analyzing complex request using LangGraph core: "${prompt}"...`);

        // Execute the StateGraph Brain!
        const resultState = await MultiAgentBrain.invoke({
          userId,
          taskPrompt: prompt,
        });

        io.to(room).emit("agent_stream", `⚡ Execution finalized via ${resultState.routingDecision} topology.`);

        // Final payload delivery
        io.to(room).emit("agent_complete", { 
          messageId,
          result: resultState.finalDraft 
        });

      } catch (error: any) {
        logger.error(`[Worker] Failed to process task ${messageId}`, error);
        getIo().to(`agent_${userId}`).emit("agent_error", { messageId, error: error.message || "Critical Reasoning Failure" });
      }
    },
  });
};
