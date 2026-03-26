"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_fallback_key";
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const apiKeyHeader = req.headers["x-api-key"];
        // 1. API Key Authentication (For external developer consumption)
        if (apiKeyHeader && typeof apiKeyHeader === "string") {
            const user = await prisma_1.prisma.user.findUnique({
                where: { apiKey: apiKeyHeader }
            });
            if (!user) {
                res.status(401).json({ error: "Invalid API Key provided." });
                return;
            }
            req.user = { id: user.id, email: user.email };
            return next();
        }
        // 2. Standard JWT Authentication (Dashboard Flow)
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            if (!token) {
                res.status(401).json({ error: "Malformed authentication header." });
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Verify user actually still exists in DB
            const userExists = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
            if (!userExists) {
                res.status(401).json({ error: "User backing this token no longer exists." });
                return;
            }
            req.user = { id: decoded.userId, email: decoded.email };
            return next();
        }
        // Completely unauthorized
        res.status(401).json({ error: "Authentication required. Provide a Bearer JWT or x-api-key Header." });
    }
    catch (error) {
        logger_1.logger.error("[Auth Middleware] Authorization failed:", error.message);
        res.status(401).json({ error: "Invalid or Expired Token." });
    }
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=auth.middleware.js.map