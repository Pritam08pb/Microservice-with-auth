"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const plugin_controller_1 = require("../controllers/plugin.controller");
const router = (0, express_1.Router)();
// Endpoints for Users to "Plug-In" external accounts
router.post("/google/connect", plugin_controller_1.pluginController.getGoogleAuth);
router.get("/google/callback", plugin_controller_1.pluginController.handleGoogleCallback);
exports.default = router;
//# sourceMappingURL=plugin.routes.js.map