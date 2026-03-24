import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { logger } from "../utils/logger";

let io: Server;

export const initSocketManager = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Allows Gateway to seamlessly proxy
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    logger.info(`🔌 UI Client connected for Agent Streaming: ${socket.id}`);

    // UI will join a room mapped to their user_id to receive private agent thoughts
    socket.on("join_agent_room", (userId: string) => {
      socket.join(`agent_${userId}`);
      logger.info(`Client ${socket.id} joined Agent Room: agent_${userId}`);
    });

    socket.on("disconnect", () => {
      logger.info(`🔌 UI Client disconnected: ${socket.id}`);
    });
  });
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized yet!");
  }
  return io;
};
