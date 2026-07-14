// backend/src/utils/jwt.ts

import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

const JWT_EMAIL_SECRET =
  process.env.JWT_EMAIL_SECRET ||
  "your-email-verification-secret-change-in-production";

/* ----------------------------------------
   Main Auth Token (login / session)
-----------------------------------------*/
export interface JWTPayload {
  userId:  string;
  email:   string;
  isAdmin: boolean;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

/* ----------------------------------------
   Email Verification Token
   Short-lived (24h), signed separately
-----------------------------------------*/
export interface EmailVerificationPayload {
  userId: string;
  email:  string;
  type:   "email-verification";
}

export const generateEmailVerificationToken = (
  userId: string,
  email: string
): string => {
  return jwt.sign(
    { userId, email, type: "email-verification" } as EmailVerificationPayload,
    JWT_EMAIL_SECRET,
    { expiresIn: "24h" }
  );
};

export const verifyEmailToken = (
  token: string
): EmailVerificationPayload | null => {
  try {
    const payload = jwt.verify(
      token,
      JWT_EMAIL_SECRET
    ) as EmailVerificationPayload;

    if (payload.type !== "email-verification") return null;

    return payload;
  } catch {
    return null;
  }
};

/* ----------------------------------------
   Password Reset Token
   Very short-lived (1h), crypto random
-----------------------------------------*/
export const generatePasswordResetToken = (): {
  token:     string;
  hashedToken: string;
  expiresAt: Date;
} => {
  const token       = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const expiresAt   = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return { token, hashedToken, expiresAt };
};

export const hashResetToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");