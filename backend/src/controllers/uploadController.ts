// backend/src/controllers/uploadController.ts
//
// Returns a signed upload signature so the frontend can
// POST directly to Cloudinary without exposing the secret.

import { Response } from "express";
import cloudinary from "../config/cloudinary";
import { AuthRequest } from "../middleware/auth";

export const getUploadSignature = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const folder    = (req.query.folder as string) || "cadec";
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    res.json({
      success:    true,
      signature,
      timestamp,
      folder,
      cloudName:  process.env.CLOUDINARY_CLOUD_NAME,
      apiKey:     process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Cloudinary Signature Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate signature" });
  }
};