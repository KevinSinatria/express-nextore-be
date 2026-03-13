import z from "zod";
import userSchema from "./user.schema.js";
import prisma from "../../config/prisma.js";
import {Prisma} from "../../generated/prisma/client.js";
import { getPaginationParams, createPaginationMeta} from "../../utils/pagination.js";
import { CustomError } from "../../utils/custom-error.js";
import { auth } from "../../lib/auth.js";

type CreateUserParams = z.infer<typeof userSchema.createUserSchema>;

const userService = {
    getAllUsers: async ({query}: {query: any}) => {
        const {page, limit, skip} = getPaginationParams({
            page: parseInt(query.page || "1"),
            limit: parseInt(query.limit || "10"),
        });

        const where: Prisma.UserWhereInput = query.search ? {
            OR: [
                {name: {contains: query.search, mode: "insensitive"}},
                {username: {contains: query.search, mode: "insensitive"}},
            ],
        } : {};
 
        const [users, count] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit || 10,
                include: { accounts: {select: {providerId: true}}},
                orderBy: {createdAt: "desc"},
            }),
            prisma.user.count({where}),
        ]);

        return {data: users, meta: createPaginationMeta(count, page, limit)};
    },

    getUserById: async ({id}: {id: string}) => {
        const user = await prisma.user.findUnique({
            where: {id},
            include: {accounts: true, sessions: true}
        })
        if (!user) throw new CustomError(404, `User with ID ${id} not found`);
        return user;
    },

    getUserByUsername: async ({username}: {username: string}) => {
        const user = await prisma.user.findUnique({
            where: {username},
            include: {accounts: true, sessions: true}
        })
        if (!user) throw new CustomError(404, `User with username ${username} not found`);
        return user;
    },

    createUser: async ({data}: {data: CreateUserParams["body"]}) =>{
        const newUser = await auth.api.signUpEmail({
            body: {
                email: `${data.username}@nextore.com`,
                password: data.password,
                username: data.username,
                name: data.name,
                role: data.role,
            },
        });

    return await prisma.user.update({
        where: {id: newUser.user.id},
        data: {role: data.role}
    });
    },

    updateUser: async ({id, data}: {id: string; data: any}) => {
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([__, v]) => v !== undefined)
        );

        return await prisma.user.update({
            where: {id},
            data: cleanData,
        });
    },

    deleteUser: async ({id}: {id: string}) => {
        return await prisma.user.delete({where: {id}});
    },
};

export default userService;