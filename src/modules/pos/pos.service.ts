import prisma from "../../config/prisma.js";
import {CustomError} from "../../utils/custom-error.js";
import type z from "zod";
import type posSchema from "./pos.schema.js";

type CreatePosBody = z.infer<typeof posSchema.createPosSchema>["body"];
type UpdatePosBody = z.infer<typeof posSchema.updatePosSchema>["body"];

const posService = {
  createPos: async (data: CreatePosBody) => {
    return await prisma.pos.create({
      data: {
        ...data,
        isActive: false,
      },
    });
  },

  getAllPos: async () => {
    return await prisma.pos.findMany({
      include: {
        activeUser: {
          select: {
            id: true,
            name: true,
            username: true,
            roles: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
  
  getPosById: async (id: string) => {
    const pos = await prisma.pos.findUnique({
      where: {id},
      include: {
        activeUser: {
          select: {
            id: true,
            name: true,
            username: true,
            roles: true,
          },
        },
      },
    });
    if (!pos) {
      throw new CustomError(404, "POS Terminal not found");
    }

    return pos;
  },

updatePos: async (id: string, data:UpdatePosBody) => {
  const existingPos = await prisma.pos.findUnique({ where: {id} });
  if (!existingPos) throw new CustomError(404, "POS terminal not found");
 
    const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.deviceName !== undefined) updateData.deviceName = data.deviceName;
    
    const updatePos = await prisma.pos.update({
      where: {id},
      data: updateData,
    });

    return updatePos;
  },

  deletePos: async (id: string) => {
    const existingPos = await prisma.pos.findUnique({where: {id}});
    if (!existingPos) throw new CustomError(404, "POS terminal not found");

    if (existingPos.isActive) {
      throw new CustomError(400, "Cannot delete a  POS terminal that is currently active/in use");
    }

    return await prisma.pos.delete({where: {id}});
  },
};

export default posService;

