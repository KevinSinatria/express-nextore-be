import prisma from "../../config/prisma.js";
import {CustomError} from "../../utils/custom-error.js";

const cashShiftService = {
    openShift: async (userId: string, startingCash: number) => {
        const activeShift = await prisma.cashShift.findFirst({
            where: {userId, status: "OPEN"},
        });

        if (activeShift) {
            throw new CustomError(400, "You still have unclosed shifts.");
        }

        return await prisma.cashShift.create({
            data: {
                userId,
                startingCash,
                status: "OPEN",
            },
        });
    },
    
    getCurrentShiftStatus: async (userId: string) => {
        const shift = await prisma.cashShift.findFirst({
            where: {userId, status: "OPEN"},
        });

        if (!shift) throw new CustomError(404, "No active shift found");

        const sales = await prisma.transaction.aggregate({
            where: {
                userId,
                createdAt: {gte: shift.startTime},
                paymentMethod: "CASH",
                status: "COMPLETED",
            },
            _sum: {totalNet: true},
        });

        const expectedCash = shift.startingCash + (sales._sum.totalNet || 0);
        
        return {
            ...shift,
            expectedCash,
            currentSales: sales._sum.totalNet || 0
        };
    },

    closeShift: async (userId: string, actualCash: number) => {
        const shift = await prisma.cashShift.findFirst({
            where: {userId, status: "OPEN"},
        });

        if (!shift) return null;

        const sales = await prisma.transaction.aggregate({
            where: {
                userId,
                createdAt: {gte: shift.startTime},
                paymentMethod: "CASH",
                status: "COMPLETED",
            },
            _sum: {totalNet: true},
        });

        const totalSales = sales._sum.totalNet || 0;
        const expectedCash = shift.startingCash + totalSales;
        const difference = actualCash - expectedCash;

        return await prisma.cashShift.update({
            where: {id: shift.id},
            data: {
                endTime: new Date(),
                actualCash,
                expectedCash,
                difference,
                status: "CLOSED",
            },
        });
    },
};

export default cashShiftService;