// backend/src/routes/authRoutes.ts

import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  oauthCallback,
  resendVerificationPublic,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

/* ── Local Auth ── */
router.post("/register",  register);
router.post("/login",     login);
router.get("/me",         authenticate, getMe);
router.post("/resend-verification-public", resendVerificationPublic);

/* ── Email Verification ── */
router.get("/verify-email",       verifyEmail);              // public — token in query
router.post("/resend-verification", authenticate, resendVerification);

/* ── Password Reset ── */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

/* ── Google OAuth ── */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session:         false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth/callback?error=oauth_failed`,
  }),
  oauthCallback
);

export default router;