import { Router } from "express";
import posController from "./pos.controller.js";
import { authorizeRole, isAuthenticated } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import posSchema from "./pos.schema.js";
import { Role } from "../../generated/prisma/enums.js";

const router = Router();

router.use(isAuthenticated);

router.get(
  "/", 
  authorizeRole([Role.ADMIN, Role.SUPERVISOR, Role.CASHIER]), 
  posController.getAllPos
);

router.get(
  "/:id",
  authorizeRole([Role.ADMIN, Role.SUPERVISOR, Role.CASHIER]),
  validate(posSchema.getPosByIdSchema),
  posController.getPosById,
);

router.post
  ("/", 
  authorizeRole([Role.ADMIN]),
  validate(posSchema.createPosSchema), 
  posController.createPos
);

router.put(
  "/:id", 
  authorizeRole([Role.ADMIN]),
  validate(posSchema.updatePosSchema), 
  posController.updatePos
);

router.delete(
  "/:id", 
  authorizeRole([Role.ADMIN]),
  posController.deletePos
);

export default router;
