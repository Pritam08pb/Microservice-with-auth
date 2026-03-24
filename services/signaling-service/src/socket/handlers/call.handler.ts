import { Server, Socket } from "socket.io";
import { getSocketIds, getUserState, setUserState } from "./connection.handler";
  import { generateToken } from "../../utils/livekit";


// ✅ TYPES (no fromUserId anymore)
interface CallUserPayload {
  toUserId: string;
}

interface AcceptCallPayload {
  toUserId: string;
  roomId: string;
}

interface RejectCallPayload {
  toUserId: string;
}

interface EndCallPayload {
  toUserId: string;
}

export const handleCallEvents = (socket: Socket, io: Server) => {

  // 📞 CALL USER
  socket.on("call-user", ({ toUserId }: CallUserPayload) => {

    const fromUserId = socket.data.user.userId;

    console.log("📞 Call request:", fromUserId, "→", toUserId);

    const targetSockets = getSocketIds(toUserId);

    // ❌ user offline
    if (targetSockets.length === 0) {
      socket.emit("user-offline");
      return;
    }

    // ❌ receiver busy
    if (getUserState(toUserId) !== "IDLE") {
      socket.emit("user-busy");
      return;
    }

    // ❌ caller busy
    if (getUserState(fromUserId) !== "IDLE") {
      socket.emit("already-in-call");
      return;
    }

    // ✅ set states
    setUserState(fromUserId, "RINGING");
    setUserState(toUserId, "RINGING");

    // 🔥 send to ALL receiver devices
    targetSockets.forEach((id) => {
      io.to(id).emit("incoming-call", {
        fromUserId,
      });
    });
  });

  // ✅ ACCEPT CALL

socket.on("accept-call", async ({ toUserId }) => {

  const fromUserId = socket.data.user.userId;

  if (getUserState(fromUserId) !== "RINGING") return;

  setUserState(toUserId, "IN_CALL");
  setUserState(fromUserId, "IN_CALL");

  // 🔥 create room
  const roomName = `room_${Date.now()}`;

  // 🔥 generate tokens
  const callerToken = await generateToken(toUserId, roomName);
  const receiverToken = await generateToken(fromUserId, roomName);

  const callerSockets = getSocketIds(toUserId);
  const receiverSockets = getSocketIds(fromUserId);

  callerSockets.forEach(id => {
    io.to(id).emit("call-accepted", {
      roomName,
      token: callerToken,
    });
  });

  receiverSockets.forEach(id => {
    io.to(id).emit("call-accepted", {
      roomName,
      token: receiverToken,
    });
  });

});

  // ❌ REJECT CALL
  socket.on("reject-call", ({ toUserId }: RejectCallPayload) => {

    const fromUserId = socket.data.user.userId;

    console.log("❌ Call rejected:", fromUserId, "→", toUserId);

    // ❌ prevent duplicate reject
    if (getUserState(fromUserId) !== "RINGING") return;

    setUserState(toUserId, "IDLE");
    setUserState(fromUserId, "IDLE");

    const callerSockets = getSocketIds(toUserId);

    callerSockets.forEach((id) => {
      io.to(id).emit("call-rejected");
    });
  });

  // 📴 END CALL
  socket.on("end-call", ({ toUserId }: EndCallPayload) => {

    const fromUserId = socket.data.user.userId;

    console.log("📴 Call ended:", fromUserId, "<->", toUserId);

    // ❌ ignore invalid state
    if (getUserState(fromUserId) !== "IN_CALL") return;

    setUserState(toUserId, "IDLE");
    setUserState(fromUserId, "IDLE");

    const callerSockets = getSocketIds(toUserId);
    const receiverSockets = getSocketIds(fromUserId);

    callerSockets.forEach((id) => {
      io.to(id).emit("call-ended");
    });

    receiverSockets.forEach((id) => {
      io.to(id).emit("call-ended");
    });
  });

};