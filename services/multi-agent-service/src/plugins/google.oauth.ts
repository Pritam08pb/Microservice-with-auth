import { google } from "googleapis";
import { logger } from "../utils/logger";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || "mock_client",
  process.env.GOOGLE_CLIENT_SECRET || "mock_secret",
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:4001/api/v1/plugins/google/callback"
);

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly'
];

export const generateGoogleAuthUrl = (userId: string) => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Demands a Refresh Token
    scope: SCOPES,
    prompt: 'consent',
    state: userId // Pass the userId to the redirect so we can save it to Postgres later
  });
};

export const verifyGoogleCallback = async (code: string, userId: string) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store in Postgres (Mocked here for now)
    // await prisma.userPlugin.upsert({ ... })
    logger.info(`[OAuth] Successfully bound Google Workspace to user: ${userId}`);
    
    return tokens.refresh_token;
  } catch (error) {
    logger.error(`[OAuth] Token generation failed for user: ${userId}`, error);
    throw error;
  }
};

export const getGmailClient = (refreshToken: string) => {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: "v1", auth: oauth2Client });
};
