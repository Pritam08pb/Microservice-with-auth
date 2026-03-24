"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const document_controller_1 = require("../controllers/document.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get("/", auth_middleware_1.requireAuth, document_controller_1.documentController.listDocuments);
router.post("/upload", auth_middleware_1.requireAuth, upload.single("file"), document_controller_1.documentController.uploadDocument);
router.delete("/:id", auth_middleware_1.requireAuth, document_controller_1.documentController.deleteDocument);
exports.default = router;
//# sourceMappingURL=document.routes.js.map