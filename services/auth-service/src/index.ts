import app from "./app";
import { ENV } from "./config/env";
import { logger } from "./utils/logger";
import connectPostgres from "./config/dbConfig";

const startServer = async () => {
  try {
    // connect DB first
    await connectPostgres();

    const server = app.listen(ENV.PORT, () => {
      logger.info(`🚀 Auth Service running on port ${ENV.PORT}`);
    });

    // graceful shutdown
    process.on("SIGINT", () => {
      logger.info("Shutting down server...");
      server.close(() => process.exit(0));
    });

    process.on("SIGTERM", () => {
      logger.info("SIGTERM received...");
      server.close(() => process.exit(0));
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
