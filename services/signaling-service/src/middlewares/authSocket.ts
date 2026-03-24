import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

const JWT_SECRET = "helpy08"; // same as auth-service

export const verifySocket = (socket: Socket, next: any) => {
  try {
    const token = socket.handshake.auth?.token;

    console.log("🔐 TOKEN:", token); // 👈 ADD

    if (!token) {
      console.log("❌ NO TOKEN");
      return next(new Error("Unauthorized"));
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);

    console.log("✅ DECODED:", decoded); // 👈 ADD

    socket.data.user = {
      userId: decoded.userId,
    };

    next();
  } catch (err) {
    console.log("❌ AUTH ERROR:", err); // 👈 ADD
    return next(new Error("Invalid token"));
  }
};
