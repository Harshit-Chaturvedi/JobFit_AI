import { Router } from "express";
import { upload } from "../middleware/upload";
import { parseResume } from "../controllers/resumeController";

export const resumeRouter = Router();

resumeRouter.post("/resume/parse", upload.single("resume"), parseResume);
