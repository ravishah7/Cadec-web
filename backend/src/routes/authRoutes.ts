import { Router } from "express";
import passport from "passport";

import {
  register,
  login,
  getMe,
  oauthCallback,
} from "../controllers/authController";

import { authenticate } from "../middleware/auth";

const router = Router();

/* ------------------------------
   Local Authentication
--------------------------------*/

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe); // 

/* ------------------------------
   Google OAuth
--------------------------------*/

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect:
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_auth_failed`,
  }),
  oauthCallback
);

export default router;