"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = exports.initSocketManager = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = require("../utils/logger");
let io;
const initSocketManager = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*", // Allows Gateway to seamlessly proxy
            methods: ["GET", "POST"]
        }
    });
    io.on("connection", (socket) => {
        logger_1.logger.info(`🔌 UI Client connected for Agent Streaming: ${socket.id}`);
        // UI will join a room mapped to their user_id to receive private agent thoughts
        socket.on("join_agent_room", (userId) => {
            socket.join(`agent_${userId}`);
            logger_1.logger.info(`Client ${socket.id} joined Agent Room: agent_${userId}`);
        });
        socket.on("disconnect", () => {
            logger_1.logger.info(`🔌 UI Client disconnected: ${socket.id}`);
        });
    });
};
exports.initSocketManager = initSocketManager;
const getIo = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized yet!");
    }
    return io;
};
exports.getIo = getIo;
//# sourceMappingURL=socket.manager.js.map