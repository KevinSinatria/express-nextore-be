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
    body: z.object({
        name: z.string().min(1, "Name must be at least 1 character"),
        phone: z.string().min(8, "Phone number minimum 8 digits").optional().nullable(),
    }),
});

const updateMemberSchema = z.object({
    params: z.object({
        id: z.string().cuid(),
    }),
    body: z.object({
        name: z.string().min(1).optional(),
        phone: z.string().min(8).optional().nullable(),
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