"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginService = exports.PluginService = void 0;
const google_oauth_1 = require("../plugins/google.oauth");
const logger_1 = require("../utils/logger");
const prisma_1 = require("../config/prisma");
class PluginService {
    /**
     * Retrieves the OAuth2 Consent URL to bind Google Workspace APIs.
     */
    getGoogleConsentUrl(userId) {
        return (0, google_oauth_1.generateGoogleAuthUrl)(userId);
    }
    /**
     * Validates the Google OAuthCallback, extracts the refresh tokens, and persists them into the vault.
     */
    async processGoogleCallback(code, userId) {
        try {
            // Passes the OAuth code to the plugin SDK to farm the permanent refresh vault
            const refreshToken = await (0, google_oauth_1.verifyGoogleCallback)(code, userId);
            if (refreshToken) {
                await prisma_1.prisma.oAuthIntegration.upsert({
                    where: { userId },
                    update: { refreshToken, provider: "google" },
                    create: { userId, refreshToken, provider: "google" }
                });
                logger_1.logger.info(`[Plugin Service] Vaulted Google Identity for User: ${userId} in Postgres DB.`);
            }
            // Enforce strict string execution bounds against standard Google API undefined union limits 
            return refreshToken || "";
        }
        catch (error) {
            logger_1.logger.error(`[Plugin Service] Failed to process Identity Handshake`, error);
            throw new Error("OAuth Negotiation Failed");
        }
    }
}
exports.PluginService = PluginService;
exports.pluginService = new PluginService();
//# sourceMappingURL=plugin.service.js.map