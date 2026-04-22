import z from "zod";
import { Role } from "../../generated/prisma/enums.js";

const selectRoleSchema = z.object({
  body: z.object({
    role: z.enum(Role),
  }),
});

const selectPosSchema = z.object({
  body: z.object({
    posId: z.string().min(1, "ID POS wajib diisi"),
    startingCash: z.number().min(0, "Kas awal tidak boleh bernilai negatif").optional(),
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
    actualCash: z.number().min(0, "Kas tunai tidak boleh bernilai negatif").optional(),
  })
})

const authSchema = {
  selectRoleSchema,
  selectPosSchema,
  loginSchema,
};

export default authSchema;