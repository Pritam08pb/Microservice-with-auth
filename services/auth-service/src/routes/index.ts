import { Router } from "express";
import  authroutes from "./authRoutes";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});
router.use("/",authroutes);

export default router;