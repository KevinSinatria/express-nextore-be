import { Router } from "express";
import { authorizeRole, isAuthenticated } from "../../middlewares/auth.middleware.js";
import authController from "./auth.controller.js";

const router = Router();

router.post("/select-role", isAuthenticated, authController.selectRole);

router.post(
  "/select-pos",
  isAuthenticated,
  authorizeRole(["SUPERVISOR", "CASHIER"]),
  authController.selectPos,
);

router.post("/login", authController.login);
router.post("/logout", isAuthenticated, authController.logout);

export default router;