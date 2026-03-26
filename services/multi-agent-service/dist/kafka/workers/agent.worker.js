"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAgentWorker = void 0;
const kafka_client_1 = require("../kafka.client");
const logger_1 = require("../../utils/logger");
const socket_manager_1 = require("../../sockets/socket.manager");
const core_agent_1 = require("../../agents/core.agent");
const startAgentWorker = async () => {
    const consumer = (0, kafka_client_1.getKafkaConsumer)();
    if (!consumer) {
        logger_1.logger.error("Cannot start Agent Worker: Kafka Consumer is offline.");
        return;
    }
    logger_1.logger.info("🤖 Agent Worker Daemon spinning up to listen for tasks...");
    await consumer.run({
        partitionsConsumedConcurrently: 5, // Process 5 users in parallel
        eachMessage: async ({ topic, partition, message }) => {
            if (!message.value)
                return;
            const payload = JSON.parse(message.value.toString());
            const { messageId, userId, prompt } = payload;
            logger_1.logger.info(`[Worker] Received Task ${messageId} from User ${userId}`);
            try {
                const io = (0, socket_manager_1.getIo)();
                const room = `agent_${userId}`;
                // 1. Notify UI that agent picked up the task
                io.to(room).emit("agent_status", { status: "thinking", messageId });
                io.to(room).emit("agent_stream", `🧠 Analyzing complex request using LangGraph core: "${prompt}"...`);
                // Execute the StateGraph Brain!
                const resultState = await core_agent_1.MultiAgentBrain.invoke({
                    userId,
                    taskPrompt: prompt,
                });
                io.to(room).emit("agent_stream", `⚡ Execution finalized via ${resultState.routingDecision} topology.`);
                // Final payload delivery
                io.to(room).emit("agent_complete", {
                    messageId,
                    result: resultState.finalDraft
                });
            }
            catch (error) {
                logger_1.logger.error(`[Worker] Failed to process task ${messageId}`, error);
                (0, socket_manager_1.getIo)().to(`agent_${userId}`).emit("agent_error", { messageId, error: error.message || "Critical Reasoning Failure" });
            }
        },
    });
};
exports.startAgentWorker = startAgentWorker;
//# sourceMappingURL=agent.worker.js.map