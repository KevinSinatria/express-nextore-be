import { Router } from "express";
import memberController from "./member.controller.js";
import memberSchema from "./member.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  authorizeRole,
  isAuthenticated,
} from "../../middlewares/auth.middleware.js";

const router = Router();
router.use(isAuthenticated);

router.get(
  "/",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(memberSchema.getAllMembersSchema),
  memberController.getAllMembers,
);

router.get(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(memberSchema.getMemberByIdSchema),
  memberController.getMemberById,
);

router.post(
  "/",
  authorizeRole(["ADMIN", "SUPERVISOR", "CASHIER"]),
  validate(memberSchema.createMemberSchema),
  memberController.createMember,
);

router.put(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  validate(memberSchema.updateMemberSchema),
  memberController.updateMember,
);

router.delete(
  "/:id",
  authorizeRole(["ADMIN", "SUPERVISOR"]),
  validate(memberSchema.deleteMemberSchema),
  memberController.deleteMember,
);

export default router;
