import app from "./app";
import { ENV } from "./config/env";
import { logger } from "./utils/logger";
import connectPostgres from "./config/dbConfig";
import { createServer } from "http";
import { initSocketManager } from "./sockets/socket.manager";
import { initKafka } from "./kafka/kafka.client";
import { startAgentWorker } from "./kafka/workers/agent.worker";

const startServer = async () => {
  try {
    // connect DB first
    await connectPostgres();

    // Boot Event Brokers
    await initKafka();
    await startAgentWorker();

    const httpServer = createServer(app);
    
    // Initialize real-time brain streaming
    initSocketManager(httpServer);

    httpServer.listen(ENV.PORT, () => {
      logger.info(`🚀 Multi-Agent Service running on port ${ENV.PORT}`);
    });

    // graceful shutdown
    process.on("SIGINT", () => {
      logger.info("Shutting down Agent server...");
      httpServer.close(() => process.exit(0));
    });

    process.on("SIGTERM", () => {
      logger.info("SIGTERM received...");
      httpServer.close(() => process.exit(0));
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
