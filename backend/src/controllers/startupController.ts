import { Request, Response } from "express";
import Startup from "../models/Startup";

// Public: list all active startups
export const getStartups = async (_req: Request, res: Response): Promise<void> => {
  try {
    const startups = await Startup.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: startups });
  } catch (error) {
    console.error("Get Startups Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};