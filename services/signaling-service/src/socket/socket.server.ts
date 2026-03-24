import { Server, Socket } from "socket.io";
import { handleConnection } from "./handlers/connection.handler";
import { handleCallEvents } from "./handlers/call.handler";
import jwt from "jsonwebtoken";

// ✅ MUST MATCH auth-service
const JWT_SECRET = "helpy08";

export const setupSocket = (io: Server) => {

  // 🔥 AUTH MIDDLEWARE
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      console.log("🔐 Incoming token:", token); // DEBUG

      if (!token) {
        console.log("❌ No token received");
        return next(new Error("Unauthorized: No token"));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

      console.log("✅ Token decoded:", decoded); // DEBUG

      socket.data.user = {
        userId: decoded.userId,
      };

      next();
    } catch (err: any) {
      console.log("❌ AUTH ERROR:", err.message); // DEBUG
      return next(new Error("Unauthorized: Invalid token"));
    }
  });

  // 🔥 CONNECTION HANDLER
  io.on("connection", (socket: Socket) => {

    const userId = socket.data.user?.userId;

    console.log("🔥 SOCKET CONNECTED:", socket.id);
    console.log("👤 Authenticated user:", userId);

    if (!userId) {
      console.log("❌ No userId on socket");
      return;
    }

    // ✅ Register user
    handleConnection(socket);

    // ✅ Debug all events
    socket.onAny((event, ...args) => {
      console.log("📡 EVENT:", event, args);
    });

    // ✅ Call events
    handleCallEvents(socket, io);

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", userId);
    });
  });
};