"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agent_routes_1 = __importDefault(require("./agent.routes"));
const plugin_routes_1 = __importDefault(require("./plugin.routes"));
const document_routes_1 = __importDefault(require("./document.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const config_routes_1 = __importDefault(require("./config.routes"));
const router = (0, express_1.Router)();
router.get("/health", (req, res) => {
    res.json({ status: "Agent Service Online", timestamp: new Date().toISOString() });
});
// Primary Webhooks processing
router.use("/api/v1/auth", auth_routes_1.default);
router.use("/api/v1/config", config_routes_1.default);
router.use("/api/v1/agents", agent_routes_1.default);
router.use("/api/v1/plugins", plugin_routes_1.default);
router.use("/api/v1/documents", document_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map