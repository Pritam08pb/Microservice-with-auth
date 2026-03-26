"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.authController.register);
router.post("/login", auth_controller_1.authController.login);
router.post("/api-key", auth_middleware_1.requireAuth, auth_controller_1.authController.generateApiKey);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map