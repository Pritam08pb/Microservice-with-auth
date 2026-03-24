import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../utils/logger";

export class ConfigController {
  
  public async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { activeDocumentId, isEmailEnabled } = req.body;

      // Update the user bot configuration
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(activeDocumentId !== undefined && { activeDocumentId }),
          ...(isEmailEnabled !== undefined && { isEmailEnabled })
        }
      });

      res.status(200).json({
        message: "Bot configuration successfully updated.",
        config: {
          activeDocumentId: updatedUser.activeDocumentId,
          isEmailEnabled: updatedUser.isEmailEnabled
        }
      });

    } catch (err: any) {
      logger.error("[Config Controller] Failed to update config", err);
      res.status(500).json({ error: "An internal error occurred while updating the bot config." });
    }
  }

  public async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      res.status(200).json({
        activeDocumentId: user?.activeDocumentId,
        isEmailEnabled: user?.isEmailEnabled
      });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch configuration." });
    }
  }
}

export const configController = new ConfigController();
