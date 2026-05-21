import { Router } from "express";
import transactionController from "../transactions/transaction.controller.js";
import { isAuthenticated, authorizeRole } from "../../middlewares/auth.middleware.js";
import { shiftGuard } from "../../middlewares/shift.middlewate.js";
import cashShiftController from "./cashshift.controller.js";

const router = Router();

router.get("/reports-shift", isAuthenticated, authorizeRole(["SUPERVISOR"]), cashShiftController.getAllshift);

router.post("/", isAuthenticated, authorizeRole(["CASHIER"]), shiftGuard, transactionController.createTransaction);
router.get("/", isAuthenticated, authorizeRole(["CASHIER"]), transactionController.getAllTransaction);
router.patch("/approve/:id", isAuthenticated, authorizeRole(["SUPERVISOR"]), cashShiftController.approveShift);
router.delete("/reports-shift/:id", isAuthenticated, authorizeRole(["SUPERVISOR"]), cashShiftController.deleteShift);

export default router;