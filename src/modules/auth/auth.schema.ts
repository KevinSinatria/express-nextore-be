import z from "zod";
import { Role } from "../../generated/prisma/enums.js";

const selectRoleSchema = z.object({
  body: z.object({
    role: z.enum(Role),
  }),
});

const selectPosSchema = z.object({
  body: z.object({
    posId: z.string().min(1, "POS ID is required"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    username: z.string(),
    password: z.string(),
  }),
});

const authSchema = {
  selectRoleSchema,
  selectPosSchema,
  loginSchema,
};

export default authSchema;