"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentService = exports.AgentService = void 0;
const kafka_client_1 = require("../kafka/kafka.client");
const logger_1 = require("../utils/logger");
class AgentService {
    /**
     * Dispatches a user thought context to the background Kafka orchestration queue.
     */
    async queueAgentTask(userId, prompt) {
        try {
            const messageId = await (0, kafka_client_1.publishAgentTask)(userId, prompt);
            logger_1.logger.info(`[Agent Service] Successfully queued task ${messageId} for user ${userId}.`);
            return messageId;
        }
        catch (error) {
            logger_1.logger.error(`[Agent Service] Fatal error queuing task to Kafka broker.`, error);
            throw new Error("Message Broker Offline");
        }
    }
}
exports.AgentService = AgentService;
exports.agentService = new AgentService();
//# sourceMappingURL=agent.service.js.map