"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUserContext = exports.deleteUserDocumentVectors = exports.ingestUserDocument = void 0;
const ollama_1 = require("@langchain/ollama");
const ioredis_1 = require("ioredis");
const logger_1 = require("../utils/logger");
const textsplitters_1 = require("@langchain/textsplitters");
// Create the unified Local RAG Vector connection
const redis = new ioredis_1.Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3
});
redis.on("error", (err) => logger_1.logger.error("[Redis] Vector Store Connection Error", err));
// Uses Nomic's highly optimized text vector model (requires ~300MB RAM locally)
const localEmbedder = new ollama_1.OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    maxRetries: 3
});
const ingestUserDocument = async (userId, documentText, docName) => {
    try {
        logger_1.logger.info(`[RAG] Vectorizing document locally for ${userId}: ${docName}`);
        if (!documentText || documentText.trim().length === 0) {
            throw new Error("Empty document completely rejected.");
        }
        // Production Chunking configuration
        const splitter = new textsplitters_1.RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200, // Provides semantic continuity across boundaries
        });
        const chunks = await splitter.createDocuments([documentText]);
        logger_1.logger.info(`[RAG] Extrapolation successful. Generated ${chunks.length} dimensional chunks.`);
        for (let i = 0; i < chunks.length; i++) {
            const chunkText = chunks[i]?.pageContent;
            if (!chunkText)
                continue;
            const vector = await localEmbedder.embedQuery(chunkText);
            const vectorKey = `rag:${userId}:${docName}:${i}`;
            // Store natively 
            await redis.hset(vectorKey, {
                text: chunkText,
                embedding: JSON.stringify(vector),
                docName: docName,
                timestamp: Date.now()
            });
        }
        logger_1.logger.info(`[RAG] Indexed ${chunks.length} vectorized chunks securely into Redis Memory Bank.`);
        return true;
    }
    catch (err) {
        logger_1.logger.error("[RAG] Failed to ingest document natively", err.message);
        throw err; // Propegate upward so Express or Kafka registers the failure state
    }
};
exports.ingestUserDocument = ingestUserDocument;
const deleteUserDocumentVectors = async (userId, docName) => {
    try {
        const prefix = `rag:${userId}:${docName}:*`;
        const keys = await redis.keys(prefix);
        if (keys.length > 0) {
            await redis.del(...keys);
            logger_1.logger.info(`[RAG] Deleted ${keys.length} vectorized chunks for ${docName}`);
        }
    }
    catch (err) {
        logger_1.logger.error("[RAG] Failed to delete document vectors", err.message);
        throw err;
    }
};
exports.deleteUserDocumentVectors = deleteUserDocumentVectors;
const searchUserContext = async (userId, query) => {
    logger_1.logger.info(`[RAG] Searching local context for ${userId} against query: "${query}"`);
    // Fake the reverse Cosine Similarity search over Redis Memory
    const vectorQuery = await localEmbedder.embedQuery(query);
    // Real implementation: FT.SEARCH ragIdx "@user_id:{$userId} => [KNN 3 @embedding $query_vector ]"
    // Faking output for scaffolding limits
    return [
        "Retrieved Context Snippet: User requested a monthly invoice summary.",
        "Retrieved Context Snippet: Format report with HTML table elements."
    ];
};
exports.searchUserContext = searchUserContext;
//# sourceMappingURL=local.embeddings.js.map