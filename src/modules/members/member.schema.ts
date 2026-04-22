import z from "zod";

const getAllMembersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  }),
});

const getMemberByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const createMemberSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nama minimal terdiri dari 1 karakter"),
    phone: z
      .number("Nomor telepon harus berupa angka")
      .min(8, "Phone number minimum 8 digits")
      .optional()
      .nullable(),
    isActive: z.boolean().optional(),
  }),
});

const updateMemberSchema = z.object({
  params: z.object({
    id: z.cuid(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z
      .number("Nomor telepon harus berupa angka")
      .min(8, "Phone number minimum 8 digits")
      .optional()
      .nullable(),
    isActive: z.boolean().optional(),
  }),
});

const deleteMemberSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export default {
  getAllMembersSchema,
  getMemberByIdSchema,
  createMemberSchema,
  updateMemberSchema,
  deleteMemberSchema,
};
