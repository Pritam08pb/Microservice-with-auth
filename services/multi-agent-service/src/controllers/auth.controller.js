"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../config/prisma");
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_fallback_key";
class AuthController {
    async register(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: "Email and password are required." });
                return;
            }
            const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                res.status(409).json({ error: "User already exists with this email." });
                return;
            }
            const saltRounds = 10;
            const passwordHash = await bcrypt_1.default.hash(password, saltRounds);
            const user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    passwordHash,
                }
            });
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
            res.status(201).json({
                message: "User registered successfully",
                token,
                user: { id: user.id, email: user.email }
            });
        }
        catch (err) {
            logger_1.logger.error("[Auth] Registration failed", err);
            res.status(500).json({ error: "Registration failed due to an internal error." });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await prisma_1.prisma.user.findUnique({ where: { email } });
            if (!user) {
                res.status(401).json({ error: "Invalid credentials" });
                return;
            }
            const isValid = await bcrypt_1.default.compare(password, user.passwordHash);
            if (!isValid) {
                res.status(401).json({ error: "Invalid credentials" });
                return;
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
            res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    activeDocumentId: user.activeDocumentId,
                    isEmailEnabled: user.isEmailEnabled
                }
            });
        }
        catch (err) {
            logger_1.logger.error("[Auth] Login failed", err);
            res.status(500).json({ error: "Login failed due to an internal error." });
        }
    }
    async generateApiKey(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: "Unauthorized endpoint." });
                return;
            }
            // Generate secure 32 byte hex string
            const newApiKey = "sk_live_" + crypto_1.default.randomBytes(32).toString('hex');
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { apiKey: newApiKey }
            });
            res.status(200).json({
                message: "New API Key generated successfully. Please store it safely.",
                apiKey: newApiKey
            });
        }
        catch (err) {
            logger_1.logger.error("[Auth] Generate API Key failed", err);
            res.status(500).json({ error: "Key generation failed." });
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map