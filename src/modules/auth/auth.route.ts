import { Router } from "express";
import { isAuthenticated } from "../../middlewares/auth.middleware.js";
import authController from "./auth.controller.js";

const router = Router();

router.post("/select-role", isAuthenticated, authController.selectRole);
router.post("/login", authController.login);

export default router;
