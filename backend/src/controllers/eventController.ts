import { Request, Response } from "express";
import Event from "../models/Event";

// Public: list active events, split into upcoming vs past based on date
export const getEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    const events = await Event.find({ isActive: true }).sort({ date: 1 });

    const upcoming = events.filter((e) => new Date(e.date) >= now);
    const past = events.filter((e) => new Date(e.date) < now);

    res.json({ success: true, upcoming, past });
  } catch (error) {
    console.error("Get Events Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};