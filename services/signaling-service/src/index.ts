import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupSocket } from "./socket/socket.server";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

setupSocket(io);

server.listen(5002, "0.0.0.0",() => {
  console.log("🚀 Signaling Service running on port 5002");
});