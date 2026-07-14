// backend/src/controllers/authController.ts

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";
import {
  generateToken,
  generateEmailVerificationToken,
  verifyEmailToken,
  generatePasswordResetToken,
  hashResetToken,
} from "../utils/jwt";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/emailService";
import { AuthRequest } from "../middleware/auth";

/* ----------------------------------------
   Register — sends verification email
-----------------------------------------*/
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists" });
    }

    const salt           = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email:           email.toLowerCase(),
      password:        hashedPassword,
      provider:        "local",
      isEmailVerified: false,
    });

    // Send verification email
    const verificationToken = generateEmailVerificationToken(
      user._id.toString(),
      user.email
    );

    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    // ── NO token returned — user must verify first ──────
    res.status(201).json({
      success:          true,
      emailNotVerified: true,
      message:
        "Account created! Please check your email and click the verification link before logging in.",
    });
    // ───────────────────────────────────────────────────
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};
/* ----------------------------------------
   Login
-----------------------------------------*/
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "This account uses Google Sign-In. Please login with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ── BLOCK unverified users ──────────────────────────
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success:          false,
        emailNotVerified: true,   // flag the frontend can detect
        message:
          "Please verify your email before logging in. Check your inbox for the verification link.",
      });
    }
    // ───────────────────────────────────────────────────

    const token = generateToken({
      userId:  user._id.toString(),
      email:   user.email,
      isAdmin: user.isAdmin,
    });

    res.json({
      success: true,
      token,
      user: {
        id:              user._id,
        name:            user.name,
        email:           user.email,
        isAdmin:         user.isAdmin,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

/* ----------------------------------------
   Get Current User (/api/auth/me)
-----------------------------------------*/
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id:              user._id,
        name:            user.name,
        email:           user.email,
        isAdmin:         user.isAdmin,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------
   Resend Verification — PUBLIC (by email)
   Used when user tries to login unverified
-----------------------------------------*/
export const resendVerificationPublic = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: "If that email exists, a verification link has been sent.",
      });
    }

    if (user.isEmailVerified) {
      return res.json({
        success: true,
        message: "This email is already verified. You can login.",
      });
    }

    const verificationToken = generateEmailVerificationToken(
      user._id.toString(),
      user.email
    );

    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({
      success: true,
      message: "Verification email sent! Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification public error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------
   Verify Email
-----------------------------------------*/
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query as { token: string };

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const payload = verifyEmailToken(token);

    if (!payload) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link. Please request a new one.",
      });
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.json({
        success: true,
        message: "Email already verified. You can login.",
        alreadyVerified: true,
      });
    }

    user.isEmailVerified = true;
    await user.save();

    // Generate fresh auth token after verification
    const authToken = generateToken({
      userId:  user._id.toString(),
      email:   user.email,
      isAdmin: user.isAdmin,
    });

    res.json({
      success: true,
      message: "Email verified successfully! You are now logged in.",
      token:   authToken,
      user: {
        id:              user._id,
        name:            user.name,
        email:           user.email,
        isAdmin:         user.isAdmin,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----------------------------------------
   Resend Verification Email
-----------------------------------------*/
export const resendVerification = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: "Email is already verified" });
    }

    const verificationToken = generateEmailVerificationToken(
      user._id.toString(),
      user.email
    );

    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({
      success: true,
      message: "Verification email sent! Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------
   Forgot Password
-----------------------------------------*/
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user || user.provider !== "local") {
      return res.json({
        success: true,
        message:
          "If an account exists with that email, a reset link has been sent.",
      });
    }

    const { token, hashedToken, expiresAt } = generatePasswordResetToken();

    user.passwordResetToken   = hashedToken;
    user.passwordResetExpires = expiresAt;
    await user.save();

    await sendPasswordResetEmail(user.email, user.name, token);

    res.json({
      success: true,
      message: "If an account exists with that email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------
   Reset Password
-----------------------------------------*/
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = hashResetToken(token);

    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset link. Please request a new one.",
      });
    }

    const salt           = await bcrypt.genSalt(12);
    user.password        = await bcrypt.hash(password, salt);
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ----------------------------------------
   OAuth Callback (Google)
-----------------------------------------*/
export const oauthCallback = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as IUser;

    if (!user || !user._id) {
      return res.status(400).json({ message: "OAuth authentication failed" });
    }

    const userId = String(user._id);

    // Google users are auto-verified
    if (!user.isEmailVerified) {
      await User.findByIdAndUpdate(userId, { isEmailVerified: true });
    }

    const token = generateToken({
      userId,
      email:   user.email,
      isAdmin: user.isAdmin,
    });

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/auth/callback?error=oauth_failed`);
  }
};