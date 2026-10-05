import { Router } from "express";
import { semanticMatchController } from "../controllers/semanticController";

export const semanticRouter = Router();

semanticRouter.post("/semantic-match", semanticMatchController);
