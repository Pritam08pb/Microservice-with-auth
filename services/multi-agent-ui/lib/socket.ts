import { io, Socket } from "socket.io-client";
import { getUserId } from "@/lib/auth";

let socket: Socket | null = null;

export function getAgentSocket() {
  if (socket) return socket;
  if (typeof window === "undefined") {
    throw new Error("Socket client unavailable server-side");
  }

  socket = io("http://localhost:4001", {
    transports: ["websocket", "polling"],
    autoConnect: false,
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connect error:", err);
  });

  const userId = getUserId();
  if (userId) {
    socket.on("connect", () => {
      socket?.emit("join_agent_room", userId);
    });
  }

  socket.connect();

  return socket;
}
