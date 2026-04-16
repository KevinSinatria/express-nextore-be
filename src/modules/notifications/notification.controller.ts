import type { Request, Response, NextFunction } from "express";
import notificationService from "./notification.service.js";
import sendResponse from "../../utils/sendResponse.js";

const notificationController = {
  triggerExpiryCheck: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await notificationService.triggerRealtimeNotification();
      sendResponse(res, 200, "Expiry check process executed successfully");
    } catch (error) {
      next(error);
    }
  },

  getExpiredList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await notificationService.getExpiredNotifications();
      sendResponse(res, 200, "Expired data fetched successdully", data);
    } catch (error) {
      next(error);
    }
  },

  getInbox: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const data = await notificationService.getUserInbox(userId);
      sendResponse(res, 200, "User inbox fetched", data);
    } catch (error) {
      next(error);
    }
  },

  markRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id as string);
      sendResponse(res, 200, "Notification marked as read");
    } catch (error) {
      next(error);
    }
  },

  markAllRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const result = await notificationService.markAllRead(userId);
      sendResponse(res, 200, "All notifications marjed as read", result);
    } catch (error) {
      next(error);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await notificationService.deleteNotification(id as string);
      sendResponse(res, 200, "Notification removed");
    } catch (error) {
      next(error);
    }
  },

  setDays: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { days } = req.body;
      const result = await notificationService.updateSetting(Number(days));
      sendResponse(res, 200, "Setting updated successfully", result);
    } catch (error) {
      next(error);
    }
  },

  getDays: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await notificationService.getSetting();
      sendResponse(res, 200, "Setting fetched successfully", data);
    } catch (error) {
      next(error);
    }
  },
};

export default notificationController;
