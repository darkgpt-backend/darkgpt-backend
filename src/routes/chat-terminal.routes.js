import { Router } from "express";
import { chatTerminalController } from "../controllers/chat-terminal.controller.js";
import { requireAuth } from "../middleware/require-auth.js";

export const chatTerminalRouter = Router();

chatTerminalRouter.post("/terminal", requireAuth, chatTerminalController.generate);
