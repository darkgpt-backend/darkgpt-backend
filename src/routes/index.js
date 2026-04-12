import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { chatSendRouter } from "./chat-send.routes.js";
import { chatTerminalRouter } from "./chat-terminal.routes.js";
import { chatRouter } from "./chat.routes.js";
import { healthRouter } from "./health.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/chat", chatSendRouter);
apiRouter.use("/chat", chatTerminalRouter);
apiRouter.use("/chats", chatRouter);
