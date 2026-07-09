// backend/src/routes/aboutRoutes.ts

import { Router } from "express";
import { getAboutContent } from "../controllers/aboutController";

const router = Router();

// Public
router.get("/", getAboutContent);

export default router;