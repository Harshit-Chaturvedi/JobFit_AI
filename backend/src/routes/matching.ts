import { Router } from "express";
import { analyzeMatchController } from "../controllers/matchingController";

export const matchingRouter = Router();

matchingRouter.post("/matching/analyze", analyzeMatchController);
