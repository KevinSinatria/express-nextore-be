import prisma from "../../config/prisma.js";
import { pusher } from "../../config/pusher.js";

const notificationService = {
  getExpiredNotifications: async () => {
    const setting = await prisma.setting.findFirst();
    const days = setting?.expiredReminderDays || 7;

    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const thresholdDate = new Date(startOfToday);
    thresholdDate.setDate(startOfToday.getDate() + days);

    const batches = await prisma.stockBatch.findMany({
      where: {
        remainingQuantity: { gt: 0 },
        expiryDate: {
          gte: startOfToday,
          lte: thresholdDate,
        },
      },
      include: {
        product: { select: { name: true, sku: true } },
      },
      orderBy: { expiryDate: "asc" },
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
        daysLeft: isExpired ? 0 : diffDays,
        quantity: b.remainingQuantity,
      };
    });
  },

  triggerRealtimeNotification: async () => {
    const expiredData = await notificationService.getExpiredNotifications();

    if (expiredData.length > 0) {
      const title = "Product Expiry Warning";
      const message = `There are ${expiredData.length} stock batches approaching expiry!`;

      const staff = await prisma.user.findMany({
        where: {
          roles: { hasSome: ["ADMIN", "SUPERVISOR"] },
        },
      });

      if (staff.length > 0) {
        await prisma.notification.createMany({
          data: staff.map((user) => ({
            userId: user.id,
            title: title,
            message: message,
          })),
        });
      }

      await pusher.trigger("inventory-channel", "expiry-alert", {
        title,
        message,
        data: expiredData,
      });
      console.log("Berhasil: Notifikasi disimpan ke DB dan dikirim via Pusher");
    }
  },

  getUserInbox: async (userId: string) => {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  markAsRead: async (id: string) => {
    return await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  markAllRead: async (userId: string) => {
    return await prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  },

  deleteNotification: async (id: string) => {
    return await prisma.notification.delete({
      where: { id },
    });
  },

  updateSetting: async (days: number) => {
    return await prisma.setting.upsert({
      where: { id: "global-setting" },
      update: { expiredReminderDays: days },
      create: { id: "global-setting", expiredReminderDays: days },
    });
  },

  getSetting: async () => {
    return (await prisma.setting.findFirst()) || { expiredReminderDays: 7 };
  },
};

export default notificationService;
