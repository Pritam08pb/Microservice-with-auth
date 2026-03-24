import { Request, Response } from "express";
import { ingestUserDocument, deleteUserDocumentVectors } from "../rag/local.embeddings";
import { logger } from "../utils/logger";
import { prisma } from "../config/prisma";
const pdfParse = require("pdf-parse");

export class DocumentController {
  
  public async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No document file provided in the request payload." });
        return;
      }

      let documentText = "";
      
      if (file.mimetype === "application/pdf") {
        const pdfData = await pdfParse(file.buffer);
        documentText = pdfData.text;
      } else {
        documentText = file.buffer.toString("utf-8");
      }

      // Check if document limit reached or already exists (optional robust check)
      const vectorKeyPrefix = `rag:${userId}:${file.originalname}`;

      // Feed into the RAG Pipeline's vector memory bank
      await ingestUserDocument(userId, documentText, file.originalname);

      const document = await prisma.document.create({
        data: {
          userId,
          filename: file.originalname,
          vectorKeyPrefix
        }
      });

      res.status(201).json({
        status: "success",
        message: "Document successfully chunked, vectorized, and saved.",
        document: {
          id: document.id,
          filename: document.filename
        }
      });
    } catch (err: any) {
      logger.error("[Document Controller] Error processing document upload:", err);
      res.status(500).json({ error: err.message || "An internal error occurred while parsing the document." });
    }
  }

  public async listDocuments(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const docs = await prisma.document.findMany({
        where: { userId },
        select: { id: true, filename: true, createdAt: true }
      });

      res.status(200).json({ documents: docs });
    } catch (err: any) {
      logger.error("[Document Controller] List documents error", err);
      res.status(500).json({ error: "Failed to list documents." });
    }
  }

  public async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const docId = req.params.id as string;
      const document = await prisma.document.findUnique({ where: { id: docId } });

      if (!document || document.userId !== userId) {
        res.status(404).json({ error: "Document not found." });
        return;
      }

      // 1. Delete deeply from Redis vectors
      await deleteUserDocumentVectors(userId, document.filename);

      // 2. Clear Active Configuration if user was using it
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.activeDocumentId === docId) {
        await prisma.user.update({
          where: { id: userId },
          data: { activeDocumentId: null }
        });
      }

      // 3. Delete from Postgres
      await prisma.document.delete({ where: { id: docId } });

      res.status(200).json({ message: "Document successfully removed from system and vector memory." });
    } catch (err: any) {
      logger.error("[Document Controller] Delete document error", err);
      res.status(500).json({ error: "Failed to delete document." });
    }
  }
}

export const documentController = new DocumentController();
