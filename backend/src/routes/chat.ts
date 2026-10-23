import { Router } from "express";
import { chatController } from "../controllers/chatController";

export const chatRouter = Router();

chatRouter.post("/chat", chatController);
