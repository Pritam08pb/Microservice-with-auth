import { generateGoogleAuthUrl, verifyGoogleCallback } from "../plugins/google.oauth";
import { logger } from "../utils/logger";
import { prisma } from "../config/prisma";

export class PluginService {
  /**
   * Retrieves the OAuth2 Consent URL to bind Google Workspace APIs.
   */
  public getGoogleConsentUrl(userId: string): string {
    return generateGoogleAuthUrl(userId);
  }

  /**
   * Validates the Google OAuthCallback, extracts the refresh tokens, and persists them into the vault.
   */
  public async processGoogleCallback(code: string, userId: string): Promise<string> {
    try {
      // Passes the OAuth code to the plugin SDK to farm the permanent refresh vault
      const refreshToken = await verifyGoogleCallback(code, userId);

      if (refreshToken) {
        await prisma.oAuthIntegration.upsert({
          where: { userId },
          update: { refreshToken, provider: "google" },
          create: { userId, refreshToken, provider: "google" }
        });
        logger.info(`[Plugin Service] Vaulted Google Identity for User: ${userId} in Postgres DB.`);
      }

      // Enforce strict string execution bounds against standard Google API undefined union limits 
      return refreshToken || "";
    } catch (error) {
      logger.error(`[Plugin Service] Failed to process Identity Handshake`, error);
      throw new Error("OAuth Negotiation Failed");
    }
  }
}

export const pluginService = new PluginService();
