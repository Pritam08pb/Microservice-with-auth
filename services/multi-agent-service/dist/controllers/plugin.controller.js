"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginController = exports.PluginController = void 0;
const plugin_service_1 = require("../services/plugin.service");
class PluginController {
    getGoogleAuth(req, res) {
        const userId = req.query.userId;
        if (!userId) {
            res.status(400).json({ error: "Client must provide userId query bound to identity." });
            return;
        }
        const consentUrl = plugin_service_1.pluginService.getGoogleConsentUrl(userId);
        res.json({ url: consentUrl });
    }
    async handleGoogleCallback(req, res) {
        const code = req.query.code;
        const userId = req.query.state;
        if (!code || !userId) {
            res.status(400).json({ error: "Malformed OAuth parameters returned." });
            return;
        }
        try {
            const refreshToken = await plugin_service_1.pluginService.processGoogleCallback(code, userId);
            res.status(200).json({
                message: "Google Account Seamlessly Connected!",
                vaulted: !!refreshToken
            });
        }
        catch (err) {
            res.status(403).json({ error: err.message });
        }
    }
}
exports.PluginController = PluginController;
exports.pluginController = new PluginController();
//# sourceMappingURL=plugin.controller.js.map