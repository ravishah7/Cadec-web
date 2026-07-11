// backend/src/routes/uploadRoutes.ts

import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import { getUploadSignature } from "../controllers/uploadController";

const router = Router();

// Only admins can get upload signatures
router.get("/signature", authenticate, requireAdmin, getUploadSignature);

export default router;