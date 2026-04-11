import { Router } from "express";
import { chatSendController } from "../controllers/chat-send.controller.js";
import { requireAuth } from "../middleware/require-auth.js";

export const chatSendRouter = Router();

chatSendRouter.post("/send", requireAuth, chatSendController.send);
