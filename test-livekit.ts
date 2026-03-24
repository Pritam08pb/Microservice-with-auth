import { AccessToken } from "livekit-server-sdk";
import https from "node:https";
import http from "node:http";

const API_KEY = process.env.LIVEKIT_API_KEY || "APIZSiqdScbVcY7";
const API_SECRET = process.env.LIVEKIT_API_SECRET || "IWyhZzST1UjeitLqdWAs4IeNuRVtfLXh2YjelA0diqAB";

const at = new AccessToken(API_KEY, API_SECRET, {
  identity: "test-user-123",
});
at.addGrant({
  roomJoin: true,
  room: "test-room",
  canPublish: true,
  canSubscribe: true,
});

const token = at.toJwt();
console.log("Generated Token:", token);

const reqUrl = `http://localhost:7880/twirp/livekit.RoomService/ListRooms`;

const data = JSON.stringify({});

const req = http.request(reqUrl, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "Content-Length": data.length,
  }
}, (res) => {
  let body = "";
  res.on("data", chunk => body += chunk);
  res.on("end", () => {
    console.log("Status Code:", res.statusCode);
    console.log("Response:", body);
  });
});

req.on("error", (e) => {
  console.error("HTTP Request Error:", e.message);
});

req.write(data);
req.end();
