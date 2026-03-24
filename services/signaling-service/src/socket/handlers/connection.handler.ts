import { Socket } from "socket.io";

// 🔥 MULTI SOCKET MAP (user → multiple sockets)
const userSocketMap = new Map<string, Set<string>>();

// 🔥 USER STATE MAP
// IDLE | RINGING | IN_CALL
const userStateMap = new Map<string, "IDLE" | "RINGING" | "IN_CALL">();

// 🔧 REGISTER CONNECTION
export const handleConnection = (socket: Socket) => {

  const userId = socket.data.user.userId;

  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }

  userSocketMap.get(userId)!.add(socket.id);

  if (!userStateMap.has(userId)) {
    userStateMap.set(userId, "IDLE");
  }

  console.log(`📌 User ${userId} connected`);

  socket.on("disconnect", () => {
    const sockets = userSocketMap.get(userId);

    if (sockets) {
      sockets.delete(socket.id);

      if (sockets.size === 0) {
        userSocketMap.delete(userId);
        userStateMap.set(userId, "IDLE");
      }
    }
  });
};

// 🔧 GET ALL SOCKETS
export const getSocketIds = (userId: string): string[] => {
  return Array.from(userSocketMap.get(userId) ?? []);
};

// 🔧 (OPTIONAL) KEEP OLD FUNCTION FOR COMPATIBILITY
export const getSocketId = (userId: string): string | undefined => {
  const sockets = userSocketMap.get(userId);
  return sockets ? Array.from(sockets)[0] : undefined;
};

// 🔧 STATE HELPERS
export const getUserState = (userId: string): "IDLE" | "RINGING" | "IN_CALL" => {
  return userStateMap.get(userId) ?? "IDLE";
};

export const setUserState = (
  userId: string,
  state: "IDLE" | "RINGING" | "IN_CALL"
) => {
  userStateMap.set(userId, state);
};