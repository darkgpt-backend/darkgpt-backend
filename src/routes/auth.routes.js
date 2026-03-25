import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/require-auth.js";

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh", authController.refreshSession);
authRouter.post("/logout", requireAuth, authController.logout);
authRouter.get("/me", requireAuth, authController.me);

