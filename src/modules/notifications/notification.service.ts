import prisma from "../../config/prisma.js";
import { pusher } from "../../config/pusher.js";

const notificationService = {
    getExpiredNotifications: async () => {
        const setting = await prisma.setting.findFirst();
        const days = setting?.expiredReminderDays || 7;

        const today = new Date ();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + days);

        const batches = await prisma.stockBatch.findMany({
            where: {
                remainingQuantity: {gt:0},
                expiryDate: {
                    lte: thresholdDate,
                },
            },
            include: {
                product: {select: {name: true, sku: true}},
            },
            orderBy: {expiryDate: "asc"},
        });

        return batches.map((b) => {
            const isExpired = b.expiryDate! < today;
            const diffTime = b.expiryDate!.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
                id: b.id,
                productName: b.product.name,
                sku: b.product.sku,
                batchNumber: b.batchNumber,
                expiryDate: b.expiryDate,
                status: isExpired ? "EXPIRED" : "NEAR_EXPIRY",
                daysLeft: isExpired ? 0: diffDays,
                quantity: b.remainingQuantity
            };
        });
    },

    triggerRealtimeNotification: async () => {
        const expiredData = await notificationService.getExpiredNotifications();

        if (expiredData.length > 0) {
            await pusher.trigger("inventory-channel","expiry-alert", {
                message: `There is a ${expiredData.length} batch of products that are close to expiry!`,
                data: expiredData
            });
            console.log("Pusher: Expiry notification sent!");
        } 
    },

    updateSetting: async (days: number) => {
        return await prisma.setting.upsert({
            where: {id: "global-setting"},
            update: {expiredReminderDays: days},
            create: {id: "global-setting", expiredReminderDays: days},
        });
    },

    getSetting: async () => {
        return await prisma.setting.findFirst() || {expiredReminderDays: 7};
    }
};

export default notificationService;