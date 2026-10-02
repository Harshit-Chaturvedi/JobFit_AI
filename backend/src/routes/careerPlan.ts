import { Router } from "express";
import { careerPlanController } from "../controllers/careerPlanController";

export const careerPlanRouter = Router();

careerPlanRouter.post("/career-plan", careerPlanController);
