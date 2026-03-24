import { getSocket } from "../services/socket";
import { store } from "../store/store";
import { setStatus, resetCallState } from "../store/features/callSlice";

export const executeCallUser = (targetUserId: string) => {
  const socket = getSocket();
  if (!socket) return;
  socket.emit("call-user", { toUserId: targetUserId });
  store.dispatch(setStatus("Calling..."));
};

export const executeAcceptCall = (incomingCaller: string) => {
  const socket = getSocket();
  if (!socket) return;
  socket.emit("accept-call", { toUserId: incomingCaller });
  store.dispatch(setStatus("Call connected 🎥"));
};

export const executeRejectCall = (incomingCaller: string) => {
  const socket = getSocket();
  if (!socket) return;
  socket.emit("reject-call", { toUserId: incomingCaller });
  store.dispatch(resetCallState());
};

export const executeEndCall = (targetUserId: string | null) => {
  const socket = getSocket();
  if (!socket) return;
  if (targetUserId) {
    socket.emit("end-call", { toUserId: targetUserId });
  }
  store.dispatch(resetCallState());
};
