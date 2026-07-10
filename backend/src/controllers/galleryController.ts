// backend/src/controllers/galleryController.ts

import { Request, Response } from "express";
import GalleryContent, { IGalleryItem } from "../models/GalleryContent";
import { AuthRequest } from "../middleware/auth";

type Section = "magazines" | "brochures" | "posters";

const VALID_SECTIONS: Section[] = ["magazines", "brochures", "posters"];

const isValidSection = (s: string): s is Section =>
  VALID_SECTIONS.includes(s as Section);

const getOrCreate = async () => {
  let doc = await GalleryContent.findOne();
  if (!doc) {
    doc = await GalleryContent.create({
      magazines: [],
      brochures: [],
      posters:   [],
    });
  }
  return doc;
};

/* ----------------------------------------
   PUBLIC — Get all gallery content
-----------------------------------------*/
export const getGalleryContent = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const doc = await getOrCreate();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Get Gallery Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----------------------------------------
   ADMIN — Add item
-----------------------------------------*/
export const addGalleryItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { section } = req.params;

    if (!isValidSection(section)) {
      res.status(400).json({ success: false, message: "Invalid section" });
      return;
    }

    const doc = await getOrCreate();

    doc[section].push({
      title:       req.body.title,
      description: req.body.description !== undefined ? req.body.description : "",
      canvaLink:   req.body.canvaLink,
      thumbnail:   req.body.thumbnail   !== undefined ? req.body.thumbnail   : "",
      isActive:    req.body.isActive    !== undefined ? req.body.isActive    : true,
    } as IGalleryItem);

    await doc.save();
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error("Add Gallery Item Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----------------------------------------
   ADMIN — Update item
-----------------------------------------*/
export const updateGalleryItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { section, id } = req.params;

    if (!isValidSection(section)) {
      res.status(400).json({ success: false, message: "Invalid section" });
      return;
    }

    const doc = await getOrCreate();
    const item = doc[section].id(id);

    if (!item) {
      res.status(404).json({ success: false, message: "Item not found" });
      return;
    }

    // Use !== undefined so empty string "" is saved correctly
    if (req.body.title       !== undefined) item.title       = req.body.title;
    if (req.body.description !== undefined) item.description = req.body.description;
    if (req.body.canvaLink   !== undefined) item.canvaLink   = req.body.canvaLink;
    if (req.body.thumbnail   !== undefined) item.thumbnail   = req.body.thumbnail;
    if (req.body.isActive    !== undefined) item.isActive    = req.body.isActive;

    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Update Gallery Item Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----------------------------------------
   ADMIN — Toggle active
-----------------------------------------*/
export const toggleGalleryItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { section, id } = req.params;

    if (!isValidSection(section)) {
      res.status(400).json({ success: false, message: "Invalid section" });
      return;
    }

    const doc = await getOrCreate();
    const item = doc[section].id(id);

    if (!item) {
      res.status(404).json({ success: false, message: "Item not found" });
      return;
    }

    item.isActive = req.body.isActive !== undefined ? req.body.isActive : !item.isActive;
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Toggle Gallery Item Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ----------------------------------------
   ADMIN — Delete item
-----------------------------------------*/
export const deleteGalleryItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { section, id } = req.params;

    if (!isValidSection(section)) {
      res.status(400).json({ success: false, message: "Invalid section" });
      return;
    }

    const doc = await getOrCreate();
    const item = doc[section].id(id);

    if (!item) {
      res.status(404).json({ success: false, message: "Item not found" });
      return;
    }

    item.deleteOne();
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (error) {
    console.error("Delete Gallery Item Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};