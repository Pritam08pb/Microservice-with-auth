"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGmailClient = exports.verifyGoogleCallback = exports.generateGoogleAuthUrl = void 0;
const googleapis_1 = require("googleapis");
const logger_1 = require("../utils/logger");
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID || "mock_client", process.env.GOOGLE_CLIENT_SECRET || "mock_secret", process.env.GOOGLE_REDIRECT_URI || "http://localhost:4001/api/v1/plugins/google/callback");
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.readonly'
];
const generateGoogleAuthUrl = (userId) => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Demands a Refresh Token
        scope: SCOPES,
        prompt: 'consent',
        state: userId // Pass the userId to the redirect so we can save it to Postgres later
    });
};
exports.generateGoogleAuthUrl = generateGoogleAuthUrl;
const verifyGoogleCallback = async (code, userId) => {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        // Store in Postgres (Mocked here for now)
        // await prisma.userPlugin.upsert({ ... })
        logger_1.logger.info(`[OAuth] Successfully bound Google Workspace to user: ${userId}`);
        return tokens.refresh_token;
    }
    catch (error) {
        logger_1.logger.error(`[OAuth] Token generation failed for user: ${userId}`, error);
        throw error;
    }
};
exports.verifyGoogleCallback = verifyGoogleCallback;
const getGmailClient = (refreshToken) => {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return googleapis_1.google.gmail({ version: "v1", auth: oauth2Client });
};
exports.getGmailClient = getGmailClient;
//# sourceMappingURL=google.oauth.js.map