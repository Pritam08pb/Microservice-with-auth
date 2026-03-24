import { Router } from "express";
import multer from "multer";
import { documentController } from "../controllers/document.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", requireAuth, documentController.listDocuments);
router.post("/upload", requireAuth, upload.single("file"), documentController.uploadDocument);
router.delete("/:id", requireAuth, documentController.deleteDocument);

export default router;
