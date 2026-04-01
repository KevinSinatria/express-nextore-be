import userController from "./user.controller.js";
import userSchema from "./user.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { Router } from "express";
import {
  authorizeRole,
  isAuthenticated,
} from "../../middlewares/auth.middleware.js";

const router = Router();
router.use(isAuthenticated, authorizeRole(["SUPERUSER"]));

router.get(
  "/",
  validate(userSchema.getAllUsersSchema),
  userController.getAllUsers,
);

router.get(
  "/id/:id",
  validate(userSchema.getUserByIdSchema),
  userController.getUserById,
);

router.get(
  "/username/:username",
  validate(userSchema.getUserByUsernameSchema),
  userController.getUserByUsername,
);

router.post(
  "/",
  validate(userSchema.createUserSchema),
  userController.createUser,
);

router.put(
  "/:id",
  validate(userSchema.updateUserSchema),
  userController.updateUser,
);

router.delete(
  "/:id",
  validate(userSchema.deleteUserSchema),
  userController.deleteUser,
);

export default router;
