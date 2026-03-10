import z from "zod";
import memberSchema from "./member.schema.js";
import { Prisma } from "../../generated/prisma/client.js";
import prisma from "../../config/prisma.js";
import {
    createPaginationMeta,
    getPaginationParams,
} from "../../utils/pagination.js";
import {CustomError} from "../../utils/custom-error.js";
import { id } from "zod/locales";

type GetAllMembersParams = z.infer<typeof memberSchema.getAllMembersSchema>;
type GetMemberByIdParams = z.infer<typeof memberSchema.getMemberByIdSchema>;
type CreateMemberParams = z.infer<typeof memberSchema.createMemberSchema>;
type UpdateMemberParams = z.infer<typeof memberSchema.updateMemberSchema>; 
type DeleteMemberParams = z.infer<typeof memberSchema.deleteMemberSchema>;

const memberService = {
    getAllMembers: async ({query}: {query: GetAllMembersParams["query"]})=> {
        const {page, limit, skip} = getPaginationParams({
            page: parseInt(query.page || "1"),
            limit: parseInt(query.limit || "10"), 
        })
        const {search} = query;

        const where: Prisma.MemberWhereInput = {};

        if (search) {
            where.OR = [
                {name: {contains: search, mode: "insensitive"}},
                {phone: {contains: search, mode: "insensitive"}},
            ];
        }

        const [members, count] = await Promise.all([
            prisma.member.findMany({
                where,
                skip,   
                take: limit || 10,
                orderBy: {createdAt: 'desc'}
            }),
            prisma.member.count({where}),
        ]);
        const meta = createPaginationMeta(count, page, limit);
        return {data: members, meta};
    },

    getMemberById: async ({id}: {id:string}) => {
        const member = await prisma.member.findUnique({
            where: {id},
            include: {
                _count: {select: {transactions: true}},
            }
        });
        if (!member) throw new CustomError(404, 'Member dengan ID ${id} tidak ditemukan');
        return member;
    },
    
    createMember: async ({data}: {data: CreateMemberParams["body"]}) => {
        return await prisma.member.create({
            data: {
                name: data.name
                phone: data.phone ?? "",
                points: 0,
            },
        });
    },

    updateMember: async ({id, data}: {id: string; data: UpdateMemberParams["body"]}) => {
        const updateData: Prisma.MemberUpdateInput = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.points !== undefined) updateData.points = data.points;
        if (data.phone !== undefined),

        const member = await prisma.member.update({
            where: {id},
            data,
        });
    },

    deleteMember: async ({id}: {id: string}) => {
        return await prisma.member.delete({
            where: {id},
        });
    },
};

export default memberService