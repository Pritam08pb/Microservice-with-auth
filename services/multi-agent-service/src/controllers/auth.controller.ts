import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_fallback_key";

export class AuthController {
  
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required." });
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(409).json({ error: "User already exists with this email." });
        return;
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
        }
      });

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: { id: user.id, email: user.email }
      });
    } catch (err: any) {
      logger.error("[Auth] Registration failed", err);
      res.status(500).json({ error: "Registration failed due to an internal error." });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(200).json({
        message: "Login successful",
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          activeDocumentId: user.activeDocumentId, 
          isEmailEnabled: user.isEmailEnabled 
        }
      });
    } catch (err: any) {
      logger.error("[Auth] Login failed", err);
      res.status(500).json({ error: "Login failed due to an internal error." });
    }
  }

  public async generateApiKey(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized endpoint." });
        return;
      }

      // Generate secure 32 byte hex string
      const newApiKey = "sk_live_" + crypto.randomBytes(32).toString('hex');

      await prisma.user.update({
        where: { id: userId },
        data: { apiKey: newApiKey }
      });

      res.status(200).json({
        message: "New API Key generated successfully. Please store it safely.",
        apiKey: newApiKey
      });
    } catch (err: any) {
      logger.error("[Auth] Generate API Key failed", err);
      res.status(500).json({ error: "Key generation failed." });
    }
  }
}

export const authController = new AuthController();
