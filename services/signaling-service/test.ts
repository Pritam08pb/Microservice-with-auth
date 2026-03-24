import { AccessToken } from "livekit-server-sdk";

const API_KEY = process.env.LIVEKIT_API_KEY || "APIZSiqdScbVcY7";
const API_SECRET = process.env.LIVEKIT_API_SECRET || "IWyhZzST1UjeitLqdWAs4IeNuRVtfLXh2YjelA0diqAB";

console.log("Using API_KEY:", API_KEY);
console.log("Using API_SECRET:", API_SECRET);

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

// Now try hitting the LiveKit HTTP api instead of ws
async function run() {
  try {
    const res = await fetch("http://localhost:7880/twirp/livekit.RoomService/ListRooms", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    console.log("LiveKit Response Status:", res.status);
    const text = await res.text();
    console.log("LiveKit Response Body:", text);
  } catch(e: any) {
    console.log("Error:", e.message);
  }
}
run();
