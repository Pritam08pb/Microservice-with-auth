export declare const generateGoogleAuthUrl: (userId: string) => string;
export declare const verifyGoogleCallback: (code: string, userId: string) => Promise<string | null | undefined>;
export declare const getGmailClient: (refreshToken: string) => import("googleapis").gmail_v1.Gmail;
//# sourceMappingURL=google.oauth.d.ts.map