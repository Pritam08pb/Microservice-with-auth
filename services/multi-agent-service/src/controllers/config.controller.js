"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configController = exports.ConfigController = void 0;
const prisma_1 = require("../config/prisma");
const logger_1 = require("../utils/logger");
class ConfigController {
    async updateConfig(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const { activeDocumentId, isEmailEnabled } = req.body;
            // Update the user bot configuration
            const updatedUser = await prisma_1.prisma.user.update({
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
        }
        catch (err) {
            logger_1.logger.error("[Config Controller] Failed to update config", err);
            res.status(500).json({ error: "An internal error occurred while updating the bot config." });
        }
    }
    async getConfig(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
            const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
            res.status(200).json({
                activeDocumentId: user?.activeDocumentId,
                isEmailEnabled: user?.isEmailEnabled
            });
        }
        catch (err) {
            res.status(500).json({ error: "Failed to fetch configuration." });
        }
    }
}
exports.ConfigController = ConfigController;
exports.configController = new ConfigController();
//# sourceMappingURL=config.controller.js.map