import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_fallback_key";

// Extend Express Request interface to include the standard user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers["x-api-key"];

    // 1. API Key Authentication (For external developer consumption)
    if (apiKeyHeader && typeof apiKeyHeader === "string") {
      const user = await prisma.user.findUnique({
        where: { apiKey: apiKeyHeader }
      });

      if (!user) {
        res.status(401).json({ error: "Invalid API Key provided." });
        return;
      }

      req.user = { id: user.id, email: user.email };
      return next();
    }

    // 2. Standard JWT Authentication (Dashboard Flow)
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (!token) {
        res.status(401).json({ error: "Malformed authentication header." });
        return;
      }
      
      const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as { userId: string; email: string };
      
      // Verify user actually still exists in DB
      const userExists = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!userExists) {
         res.status(401).json({ error: "User backing this token no longer exists." });
         return;
      }

      req.user = { id: decoded.userId, email: decoded.email };
      return next();
    }

    // Completely unauthorized
    res.status(401).json({ error: "Authentication required. Provide a Bearer JWT or x-api-key Header." });
  } catch (error: any) {
    logger.error("[Auth Middleware] Authorization failed:", error.message);
    res.status(401).json({ error: "Invalid or Expired Token." });
  }
};
