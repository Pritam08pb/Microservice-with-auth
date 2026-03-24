import { OllamaEmbeddings } from "@langchain/ollama";
import { Redis } from "ioredis";
import { logger } from "../utils/logger";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Create the unified Local RAG Vector connection
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redis.on("error", (err) => logger.error("[Redis] Vector Store Connection Error", err));

// Uses Nomic's highly optimized text vector model (requires ~300MB RAM locally)
const localEmbedder = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  maxRetries: 3
});

export const ingestUserDocument = async (userId: string, documentText: string, docName: string) => {
  try {
    logger.info(`[RAG] Vectorizing document locally for ${userId}: ${docName}`);

    if (!documentText || documentText.trim().length === 0) {
      throw new Error("Empty document completely rejected.");
    }

    // Production Chunking configuration
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200, // Provides semantic continuity across boundaries
    });

    const chunks = await splitter.createDocuments([documentText]);
    logger.info(`[RAG] Extrapolation successful. Generated ${chunks.length} dimensional chunks.`);

    for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i]?.pageContent;
        if (!chunkText) continue;

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

    logger.info(`[RAG] Indexed ${chunks.length} vectorized chunks securely into Redis Memory Bank.`);
    return true;

  } catch (err: any) {
    logger.error("[RAG] Failed to ingest document natively", err.message);
    throw err; // Propegate upward so Express or Kafka registers the failure state
  }
};

export const deleteUserDocumentVectors = async (userId: string, docName: string) => {
  try {
    const prefix = `rag:${userId}:${docName}:*`;
    const keys = await redis.keys(prefix);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`[RAG] Deleted ${keys.length} vectorized chunks for ${docName}`);
    }
  } catch (err: any) {
    logger.error("[RAG] Failed to delete document vectors", err.message);
    throw err;
  }
};

export const searchUserContext = async (userId: string, query: string): Promise<string[]> => {
  logger.info(`[RAG] Searching local context for ${userId} against query: "${query}"`);

  // Fake the reverse Cosine Similarity search over Redis Memory
  const vectorQuery = await localEmbedder.embedQuery(query);

  // Real implementation: FT.SEARCH ragIdx "@user_id:{$userId} => [KNN 3 @embedding $query_vector ]"
  // Faking output for scaffolding limits
  return [
    "Retrieved Context Snippet: User requested a monthly invoice summary.",
    "Retrieved Context Snippet: Format report with HTML table elements."
  ];
};
