// backend/src/controllers/adminController.ts

import { Response } from "express";
import mongoose, { FilterQuery } from "mongoose";
import Job, { IJob } from "../models/Job";
import Event from "../models/Event";
import Startup from "../models/Startup";
import { AuthRequest } from "../middleware/auth";

/* ================================================
   DASHBOARD STATS
================================================ */
export const getAdminStats = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      totalJobs, activeJobs,
      totalEvents, activeEvents,
      totalStartups, activeStartups,
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Event.countDocuments(),
      Event.countDocuments({ isActive: true }),
      Startup.countDocuments(),
      Startup.countDocuments({ isActive: true }),
    ]);

    res.json({
      success: true,
      totalJobs,
      activeJobs,
      totalEvents,
      activeEvents,
      totalStartups,
      activeStartups,
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================
   JOBS
================================================ */
export const adminGetJobs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      search, type, experienceLevel, isActive,
      page = "1", limit = "9",
    } = req.query;

    const query: FilterQuery<IJob> = {};

    if (typeof isActive === "string" && isActive !== "") {
      query.isActive = isActive === "true";
    }
    if (type) query.type = type;
    if (experienceLevel) {
      query.experienceLevel = { $regex: experienceLevel, $options: "i" };
    }
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { company:     { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location:    { $regex: search, $options: "i" } },
      ];
    }

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("postedBy", "name email")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Job.countDocuments(query),
    ]);

    res.json({ success: true, data: jobs, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error("Admin Get Jobs Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminCreateJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const job = await Job.create({
      title:           req.body.title,
      company:         req.body.company,
      description:     req.body.description,
      location:        req.body.location,
      type:            req.body.type,
      experienceLevel: req.body.experienceLevel,
      applyLink:       req.body.applyLink,
      companyLogo:     req.body.companyLogo,
      salary:          req.body.salary,
      requirements:    req.body.requirements ?? [],
      isActive:        req.body.isActive ?? true,
      postedBy:        req.user._id,
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error("Admin Create Job Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminUpdateJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: "Invalid Job ID" });
      return;
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    const fields = [
      "title", "company", "description", "location", "type",
      "experienceLevel", "applyLink", "companyLogo", "salary",
      "requirements", "isActive",
    ] as const;

    for (const f of fields) {
      if (req.body[f] !== undefined) (job as never as Record<string, unknown>)[f] = req.body[f];
    }

    await job.save();
    res.json({ success: true, data: job });
  } catch (error) {
    console.error("Admin Update Job Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminToggleJobActive = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: "Invalid Job ID" });
      return;
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    job.isActive = req.body.isActive ?? !job.isActive;
    await job.save();
    res.json({ success: true, data: job });
  } catch (error) {
    console.error("Admin Toggle Job Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminDeleteJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: "Invalid Job ID" });
      return;
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ success: false, message: "Job not found" });
      return;
    }

    await job.deleteOne();
    res.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("Admin Delete Job Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================================================
   EVENTS
================================================ */
export const adminGetEvents = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      search, status, category, registrationOpen,
      page = "1", limit = "9",
    } = req.query;

    const query: Record<string, unknown> = {};

    if (status)   query.status   = status;
    if (category) query.category = category;
    if (typeof registrationOpen === "string" && registrationOpen !== "") {
      // Schema field is `isRegistrationOpen`, not `registrationOpen`
      query.isRegistrationOpen = registrationOpen === "true";
    }
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location:    { $regex: search, $options: "i" } },
      ];
    }

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Event.countDocuments(query),
    ]);

    res.json({ success: true, data: events, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error("Admin Get Events Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminCreateEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const event = await Event.create({
      title:                req.body.title,
      description:          req.body.description,
      date:                 req.body.date,
      time:                 req.body.time,
      location:             req.body.location,
      image:                req.body.image,
      category:             req.body.category,
      price:                req.body.price        ?? 0,
      // Schema enum is lowercase: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
      status:               req.body.status       ?? "upcoming",
      registrationDeadline: req.body.registrationDeadline,
      // Schema field is `isRegistrationOpen`, not `registrationOpen`
      isRegistrationOpen:   req.body.isRegistrationOpen ?? true,
      maxAttendees:         req.body.maxAttendees,
      questions:            req.body.questions    ?? [],
      isActive:             req.body.isActive     ?? true,
      createdBy:            req.user._id,
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error("Admin Create Event Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminUpdateEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: "Invalid Event ID" });
      return;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    const fields = [
      "title", "description", "date", "time", "location", "image",
      "category", "price", "status", "registrationDeadline",
      "isRegistrationOpen", "maxAttendees", "questions", "isActive",
    ] as const;

    for (const f of fields) {
      if (req.body[f] !== undefined) (event as never as Record<string, unknown>)[f] = req.body[f];
    }

    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    console.error("Admin Update Event Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminToggleEventActive = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: "Invalid Event ID" });
      return;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    event.isActive = req.body.isActive ?? !event.isActive;
    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    console.error("Admin Toggle Event Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminDeleteEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: "Invalid Event ID" });
      return;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }

    await event.deleteOne();
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Admin Delete Event Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
/* ================================================
   STARTUPS
================================================ */
export const adminGetStartups = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      search, status, category, isActive,
      page = "1", limit = "9",
    } = req.query;

    const query: Record<string, unknown> = {};

    if (status)   query.status   = status;
    if (category) query.category = category;
    if (typeof isActive === "string" && isActive !== "") {
      query.isActive = isActive === "true";
    }
    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category:    { $regex: search, $options: "i" } },
      ];
    }

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const [startups, total] = await Promise.all([
      Startup.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Startup.countDocuments(query),
    ]);

    res.json({ success: true, data: startups, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error("Admin Get Startups Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminCreateStartup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const startup = await Startup.create({
      name:        req.body.name,
      description: req.body.description,
      logo:        req.body.logo,
      founders:    req.body.founders    ?? [],
      status:      req.body.status      ?? "Incubated",
      website:     req.body.website,
      category:    req.body.category,
      yearFounded: req.body.yearFounded,
      funding:     req.body.funding,
      isActive:    req.body.isActive    ?? true,
    });

    res.status(201).json({ success: true, data: startup });
  } catch (error) {
    console.error("Admin Create Startup Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminUpdateStartup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: "Invalid Startup ID" });
      return;
    }

    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      res.status(404).json({ success: false, message: "Startup not found" });
      return;
    }

    const fields = [
      "name", "description", "logo", "founders", "status",
      "website", "category", "yearFounded", "funding", "isActive",
    ] as const;

    for (const f of fields) {
      if (req.body[f] !== undefined) (startup as never as Record<string, unknown>)[f] = req.body[f];
    }

    await startup.save();
    res.json({ success: true, data: startup });
  } catch (error) {
    console.error("Admin Update Startup Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminToggleStartupActive = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: "Invalid Startup ID" });
      return;
    }

    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      res.status(404).json({ success: false, message: "Startup not found" });
      return;
    }

    startup.isActive = req.body.isActive ?? !startup.isActive;
    await startup.save();
    res.json({ success: true, data: startup });
  } catch (error) {
    console.error("Admin Toggle Startup Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminDeleteStartup = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({ success: false, message: "Invalid Startup ID" });
      return;
    }

    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      res.status(404).json({ success: false, message: "Startup not found" });
      return;
    }

    await startup.deleteOne();
    res.json({ success: true, message: "Startup deleted successfully" });
  } catch (error) {
    console.error("Admin Delete Startup Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};