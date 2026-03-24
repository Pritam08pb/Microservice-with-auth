import { Request, Response } from "express";
import { pluginService } from "../services/plugin.service";

export class PluginController {
  
  public getGoogleAuth(req: Request, res: Response): void {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({ error: "Client must provide userId query bound to identity." });
      return;
    }

    const consentUrl = pluginService.getGoogleConsentUrl(userId);
    res.json({ url: consentUrl });
  }

  public async handleGoogleCallback(req: Request, res: Response): Promise<void> {
    const code = req.query.code as string;
    const userId = req.query.state as string;

    if (!code || !userId) {
      res.status(400).json({ error: "Malformed OAuth parameters returned." });
      return;
    }

    try {
      const refreshToken = await pluginService.processGoogleCallback(code, userId);
      res.status(200).json({
        message: "Google Account Seamlessly Connected!",
        vaulted: !!refreshToken
      });
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  }
}

export const pluginController = new PluginController();
