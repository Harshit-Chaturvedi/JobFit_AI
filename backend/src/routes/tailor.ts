import { Router } from "express";
import { tailorResumeController } from "../controllers/tailorController";

export const tailorRouter = Router();
tailorRouter.post("/resume/tailor", tailorResumeController);
