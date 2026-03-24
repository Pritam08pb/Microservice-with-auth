"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const dbConfig_1 = __importDefault(require("./config/dbConfig"));
const http_1 = require("http");
const socket_manager_1 = require("./sockets/socket.manager");
const kafka_client_1 = require("./kafka/kafka.client");
const agent_worker_1 = require("./kafka/workers/agent.worker");
const startServer = async () => {
    try {
        // connect DB first
        await (0, dbConfig_1.default)();
        // Boot Event Brokers
        await (0, kafka_client_1.initKafka)();
        await (0, agent_worker_1.startAgentWorker)();
        const httpServer = (0, http_1.createServer)(app_1.default);
        // Initialize real-time brain streaming
        (0, socket_manager_1.initSocketManager)(httpServer);
        httpServer.listen(env_1.ENV.PORT, () => {
            logger_1.logger.info(`🚀 Multi-Agent Service running on port ${env_1.ENV.PORT}`);
        });
        // graceful shutdown
        process.on("SIGINT", () => {
            logger_1.logger.info("Shutting down Agent server...");
            httpServer.close(() => process.exit(0));
        });
        process.on("SIGTERM", () => {
            logger_1.logger.info("SIGTERM received...");
            httpServer.close(() => process.exit(0));
        });
    }
    catch (error) {
        logger_1.logger.error("Failed to start server", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map