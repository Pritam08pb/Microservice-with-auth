import { Request, Response } from "express";
export declare class PluginController {
    getGoogleAuth(req: Request, res: Response): void;
    handleGoogleCallback(req: Request, res: Response): Promise<void>;
}
export declare const pluginController: PluginController;
//# sourceMappingURL=plugin.controller.d.ts.map