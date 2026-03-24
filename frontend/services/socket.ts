import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket) return socket;

  const url = process.env.NEXT_PUBLIC_SIGNALING_URL || "http://192.168.1.40:5002";
  socket = io(url, {
    auth: {
      token,
    }
  });

  return socket;
};

export const getSocket = () => socket;