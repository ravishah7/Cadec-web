import { Router } from "express";
import { getStartups } from "../controllers/startupController";

const router = Router();

router.get("/", getStartups);

export default router;