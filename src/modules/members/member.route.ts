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
  validate(memberSchema.getAllMembersSchema),
  memberController.getAllMembers,
);

router.get(
  "/:id",
  validate(memberSchema.getMemberByIdSchema),
  memberController.getMemberById,
);

router.post(
  "/",
  validate(memberSchema.createMemberSchema),
  memberController.createMember,
);

router.put(
  "/:id",
  validate(memberSchema.updateMemberSchema),
  memberController.updateMember,
);

router.delete(
  "/:id",
  validate(memberSchema.deleteMemberSchema),
  memberController.deleteMember,
);

export default router;
