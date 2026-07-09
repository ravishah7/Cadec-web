import { Request, Response } from "express";
import Job from "../models/Job";

export const getJobs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) {
    console.error("Get Jobs Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
