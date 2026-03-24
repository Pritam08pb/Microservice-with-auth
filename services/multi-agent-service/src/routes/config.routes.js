"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_controller_1 = require("../controllers/config.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.put("/", auth_middleware_1.requireAuth, config_controller_1.configController.updateConfig);
router.get("/", auth_middleware_1.requireAuth, config_controller_1.configController.getConfig);
exports.default = router;
//# sourceMappingURL=config.routes.js.map