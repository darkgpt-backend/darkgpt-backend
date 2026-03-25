import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/require-auth.js";

export const chatRouter = Router();

chatRouter.use(requireAuth);

chatRouter.get("/", chatController.listChats);
chatRouter.post("/", chatController.createChat);
chatRouter.get("/:chatId/messages", chatController.listMessages);
chatRouter.post("/:chatId/messages", chatController.createMessage);

