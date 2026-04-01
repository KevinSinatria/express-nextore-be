import z from "zod";
import { Role } from "../../generated/prisma/enums.js";

const selectRoleSchema = z.object({
  body: z.object({
    role: z.enum(Role),
    sessionId: z.string(),
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
  loginSchema,
};

export default authSchema;
