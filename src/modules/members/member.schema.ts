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
        id: z.string().cuid(),
    }),
});

const createMemberSchema = z.object({
    params: z.object({
        id: z.string().cuid(),
    }),
    body: z.object({
        name: z.string().min(3, "Nama minimal 3 karakter"),
        phone: z.string().min(10, "Nomor telepon minimal 10 digit").optional().nullable(),
    }),
});

const updateMemberSchema = z.object({
    params: z.object({
        id: z.string().cuid(),
    }),
    body: z.object({
        name: z.string().min(3).optional(),
        phone: z.string().min(10).optional().nullable(),
        points: z.number().int().optional(),
    }),
});

const deleteMemberSchema = z.object({
    params: z.object({
        id: z.string().cuid(),
    }),
});

export default {
    getAllMembersSchema,
    getMemberByIdSchema,
    createMemberSchema,
    updateMemberSchema,
    deleteMemberSchema,
};