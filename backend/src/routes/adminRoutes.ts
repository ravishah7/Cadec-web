// backend/src/routes/adminRoutes.ts

import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
  getAdminStats,
  adminGetJobs, adminCreateJob, adminUpdateJob,
  adminToggleJobActive, adminDeleteJob,
  adminGetEvents, adminCreateEvent, adminUpdateEvent,
  adminToggleEventActive, adminDeleteEvent,
  adminGetStartups, adminCreateStartup, adminUpdateStartup,
  adminToggleStartupActive, adminDeleteStartup,
} from "../controllers/adminController";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

/* ---- Stats ---- */
router.get("/stats", getAdminStats);

/* ---- Jobs ---- */
router.get("/jobs",          adminGetJobs);
// cast handler to any to satisfy Express overloads when using custom AuthRequest typing
router.post("/jobs",         adminCreateJob as any);
router.put("/jobs/:id",      adminUpdateJob);
router.patch("/jobs/:id/toggle", adminToggleJobActive);
router.delete("/jobs/:id",   adminDeleteJob);

/* ---- Events ---- */
router.get("/events",            adminGetEvents);
router.post("/events",           adminCreateEvent);
router.put("/events/:id",        adminUpdateEvent);
router.patch("/events/:id/toggle", adminToggleEventActive);
router.delete("/events/:id",     adminDeleteEvent);

/* ---- Startups ---- */
router.get("/startups",              adminGetStartups);
router.post("/startups",             adminCreateStartup);
router.put("/startups/:id",          adminUpdateStartup);
router.patch("/startups/:id/toggle", adminToggleStartupActive);
router.delete("/startups/:id",       adminDeleteStartup);

export default router;