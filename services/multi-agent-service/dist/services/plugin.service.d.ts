export declare class PluginService {
    /**
     * Retrieves the OAuth2 Consent URL to bind Google Workspace APIs.
     */
    getGoogleConsentUrl(userId: string): string;
    /**
     * Validates the Google OAuthCallback, extracts the refresh tokens, and persists them into the vault.
     */
    processGoogleCallback(code: string, userId: string): Promise<string>;
}
export declare const pluginService: PluginService;
//# sourceMappingURL=plugin.service.d.ts.map