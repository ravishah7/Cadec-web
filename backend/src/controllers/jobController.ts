import { Request, Response } from "express";
import mongoose, { FilterQuery } from "mongoose";
import Job, { IJob } from "../models/Job";
import { AuthRequest } from "../middleware/auth";

/* ----------------------------------------
   Get All Jobs (Public)
-----------------------------------------*/
export const getJobs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { type, location, search, page = "1", limit = "10" } = req.query;

    const query: FilterQuery<IJob> = {
      isActive: true,
    };

    if (type) {
      query.type = type;
    }

    if (location) {
      query.location = {
        $regex: location,
        $options: "i",
      };
    }

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          company: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          experienceLevel: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const jobs = await Job.find(query)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      limit: limitNumber,
      data: jobs,
    });
  } catch (error) {
    console.error("Get Jobs Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ----------------------------------------
   Get Single Job
-----------------------------------------*/
export const getJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid Job ID",
      });
      return;
    }

    const job = await Job.findById(req.params.id).populate(
      "postedBy",
      "name email"
    );

    if (!job || !job.isActive) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Get Job Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ----------------------------------------
   Create Job
-----------------------------------------*/
export const createJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const job = await Job.create({
      title: req.body.title,
      company: req.body.company,
      description: req.body.description,
      location: req.body.location,
      type: req.body.type,
      experienceLevel: req.body.experienceLevel,
      applyLink: req.body.applyLink,
      companyLogo: req.body.companyLogo,
      salary: req.body.salary,
      requirements: req.body.requirements || [],
      postedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Create Job Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ----------------------------------------
   Update Job
-----------------------------------------*/
export const updateJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid Job ID",
      });
      return;
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    job.title = req.body.title ?? job.title;
    job.company = req.body.company ?? job.company;
    job.description = req.body.description ?? job.description;
    job.location = req.body.location ?? job.location;
    job.type = req.body.type ?? job.type;
    job.experienceLevel =
      req.body.experienceLevel ?? job.experienceLevel;
    job.applyLink = req.body.applyLink ?? job.applyLink;
    job.companyLogo = req.body.companyLogo ?? job.companyLogo;
    job.salary = req.body.salary ?? job.salary;
    job.requirements =
      req.body.requirements ?? job.requirements;
    job.isActive = req.body.isActive ?? job.isActive;

    await job.save();

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Update Job Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ----------------------------------------
   Delete Job
-----------------------------------------*/
export const deleteJob = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid Job ID",
      });
      return;
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404).json({
        success: false,
        message: "Job not found",
      });
      return;
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Delete Job Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};