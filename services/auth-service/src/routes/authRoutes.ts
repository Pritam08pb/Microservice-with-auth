import { Router } from "express";
import { login, logout, me, refresh, signup } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, signupSchema } from "../validators/auth.validator";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.post("/signup",validate(signupSchema), signup);
router.post("/login",validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware, me); 

export default router;
