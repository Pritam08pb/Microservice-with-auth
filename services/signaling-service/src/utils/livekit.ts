import { AccessToken } from "livekit-server-sdk";

const API_KEY = process.env.LIVEKIT_API_KEY ;
const API_SECRET = process.env.LIVEKIT_API_SECRET ;

export const generateToken = async (userId: string, roomName: string) => {
    console.log("API Key:", API_KEY);
  const at = new AccessToken(API_KEY, API_SECRET, {
    identity: userId,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  return await at.toJwt();
};