export declare const ingestUserDocument: (userId: string, documentText: string, docName: string) => Promise<boolean>;
export declare const deleteUserDocumentVectors: (userId: string, docName: string) => Promise<void>;
export declare const searchUserContext: (userId: string, query: string) => Promise<string[]>;
//# sourceMappingURL=local.embeddings.d.ts.map