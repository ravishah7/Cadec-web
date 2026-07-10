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

// ADD these imports at the top of adminRoutes.ts
import {
  addFacultyMember, updateFacultyMember, deleteFacultyMember,
  addCoordinator, updateCoordinator, deleteCoordinator,
  addMajorEvent, updateMajorEvent, deleteMajorEvent,
  addCompetition, updateCompetition, deleteCompetition,
  addWinner, updateWinner, deleteWinner,
  getAboutContent,
} from "../controllers/aboutController";


import {
  addGalleryItem,
  updateGalleryItem,
  toggleGalleryItem,
  deleteGalleryItem,
  getGalleryContent as getAdminGallery,
} from "../controllers/galleryController";


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



/* ---- About ---- */
router.get("/about", getAboutContent);

// Faculty
router.post("/about/faculty",        addFacultyMember);
router.put("/about/faculty/:id",     updateFacultyMember);
router.delete("/about/faculty/:id",  deleteFacultyMember);

// Coordinators
router.post("/about/coordinators",       addCoordinator);
router.put("/about/coordinators/:id",    updateCoordinator);
router.delete("/about/coordinators/:id", deleteCoordinator);

// Major Events
router.post("/about/events",       addMajorEvent);
router.put("/about/events/:id",    updateMajorEvent);
router.delete("/about/events/:id", deleteMajorEvent);

// Competitions
router.post("/about/competitions",       addCompetition);
router.put("/about/competitions/:id",    updateCompetition);
router.delete("/about/competitions/:id", deleteCompetition);

// Winners
router.post("/about/competitions/:competitionId/winners",              addWinner);
router.put("/about/competitions/:competitionId/winners/:winnerId",     updateWinner);
router.delete("/about/competitions/:competitionId/winners/:winnerId",  deleteWinner);

//Gallery

router.get("/gallery",                              getAdminGallery);
router.post("/gallery/:section",                    addGalleryItem);
router.put("/gallery/:section/:id",                 updateGalleryItem);
router.patch("/gallery/:section/:id/toggle",        toggleGalleryItem);
router.delete("/gallery/:section/:id",              deleteGalleryItem);

export default router;