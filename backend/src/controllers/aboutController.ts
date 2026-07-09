// backend/src/controllers/aboutController.ts

import { Request, Response } from "express";
import AboutContent from "../models/AboutContent";
import { AuthRequest } from "../middleware/auth";

/* ----------------------------------------
   Helper — get or create the single document
-----------------------------------------*/
const getOrCreate = async () => {
  let doc = await AboutContent.findOne();
  if (!doc) {
    doc = await AboutContent.create({
      facultyMembers:      [],
      studentCoordinators: [],
      majorEvents:         [],
      competitions:        [],
    });
  }
  return doc;
};

/* ----------------------------------------
   PUBLIC — Get About Content
-----------------------------------------*/
export const getAboutContent = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Get About Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ========================================
   FACULTY MEMBERS
======================================== */
export const addFacultyMember = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    doc.facultyMembers.push({
      name:       req.body.name,
      role:       req.body.role,
      department: req.body.department,
    });
    await doc.save();
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error("Add Faculty Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateFacultyMember = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    const member = doc.facultyMembers.id(req.params.id);
    if (!member) {
      res.status(404).json({ success: false, message: "Faculty member not found" });
      return;
    }
    member.name       = req.body.name       ?? member.name;
    member.role       = req.body.role       ?? member.role;
    member.department = req.body.department ?? member.department;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Update Faculty Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteFacultyMember = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    const member = doc.facultyMembers.id(req.params.id);
    if (!member) {
      res.status(404).json({ success: false, message: "Faculty member not found" });
      return;
    }
    member.deleteOne();
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Delete Faculty Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ========================================
   STUDENT COORDINATORS
======================================== */
export const addCoordinator = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    doc.studentCoordinators.push({
      name:       req.body.name,
      role:       req.body.role,
      department: req.body.department,
    });
    await doc.save();
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error("Add Coordinator Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCoordinator = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    const member = doc.studentCoordinators.id(req.params.id);
    if (!member) {
      res.status(404).json({ success: false, message: "Coordinator not found" });
      return;
    }
    member.name       = req.body.name       ?? member.name;
    member.role       = req.body.role       ?? member.role;
    member.department = req.body.department ?? member.department;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Update Coordinator Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteCoordinator = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    const member = doc.studentCoordinators.id(req.params.id);
    if (!member) {
      res.status(404).json({ success: false, message: "Coordinator not found" });
      return;
    }
    member.deleteOne();
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Delete Coordinator Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ========================================
   MAJOR EVENTS
======================================== */
export const addMajorEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    doc.majorEvents.push({
      title:       req.body.title,
      description: req.body.description,
      icon:        req.body.icon ?? "Calendar",
    });
    await doc.save();
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error("Add Major Event Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateMajorEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    const event = doc.majorEvents.id(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }
    event.title       = req.body.title       ?? event.title;
    event.description = req.body.description ?? event.description;
    event.icon        = req.body.icon        ?? event.icon;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Update Major Event Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteMajorEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    const event = doc.majorEvents.id(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, message: "Event not found" });
      return;
    }
    event.deleteOne();
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Delete Major Event Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ========================================
   COMPETITIONS
======================================== */
export const addCompetition = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    doc.competitions.push({
      title:    req.body.title,
      subtitle: req.body.subtitle ?? "",
      winners:  req.body.winners  ?? [],
    });
    await doc.save();
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error("Add Competition Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCompetition = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    const competition = doc.competitions.id(req.params.id);
    if (!competition) {
      res.status(404).json({ success: false, message: "Competition not found" });
      return;
    }
    competition.title    = req.body.title    ?? competition.title;
    competition.subtitle = req.body.subtitle ?? competition.subtitle;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Update Competition Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteCompetition = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    const competition = doc.competitions.id(req.params.id);
    if (!competition) {
      res.status(404).json({ success: false, message: "Competition not found" });
      return;
    }
    competition.deleteOne();
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Delete Competition Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ========================================
   WINNERS (nested inside competition)
======================================== */
export const addWinner = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    const competition = doc.competitions.id(req.params.competitionId);
    if (!competition) {
      res.status(404).json({ success: false, message: "Competition not found" });
      return;
    }
    competition.winners.push({
      name:     req.body.name,
      startup:  req.body.startup,
      position: req.body.position,
      amount:   req.body.amount,
    });
    await doc.save();
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error("Add Winner Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateWinner = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    const competition = doc.competitions.id(req.params.competitionId);
    if (!competition) {
      res.status(404).json({ success: false, message: "Competition not found" });
      return;
    }
    const winner = competition.winners.id(req.params.winnerId);
    if (!winner) {
      res.status(404).json({ success: false, message: "Winner not found" });
      return;
    }
    winner.name     = req.body.name     ?? winner.name;
    winner.startup  = req.body.startup  ?? winner.startup;
    winner.position = req.body.position ?? winner.position;
    winner.amount   = req.body.amount   ?? winner.amount;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Update Winner Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteWinner = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    const competition = doc.competitions.id(req.params.competitionId);
    if (!competition) {
      res.status(404).json({ success: false, message: "Competition not found" });
      return;
    }
    const winner = competition.winners.id(req.params.winnerId);
    if (!winner) {
      res.status(404).json({ success: false, message: "Winner not found" });
      return;
    }
    winner.deleteOne();
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Delete Winner Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};