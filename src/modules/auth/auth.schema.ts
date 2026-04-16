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
    startingCash: z.number().min(0, "Starting cash must be non-negative").optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    username: z.string(),
    password: z.string(),
  }),
});

const logoutSchema = z.object({
  body: z.object({
    actualCash: z.number().min(0, "Actual cash must be non-negative").optional(),
  })
})

const authSchema = {
  selectRoleSchema,
  selectPosSchema,
  loginSchema,
};

export default authSchema;