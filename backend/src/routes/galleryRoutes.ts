// backend/src/routes/galleryRoutes.ts

import { Router } from "express";
import { getGalleryContent } from "../controllers/galleryController";

const router = Router();

// Public
router.get("/", getGalleryContent);

export default router;