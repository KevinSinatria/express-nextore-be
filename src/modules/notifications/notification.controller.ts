import type {Request, Response, NextFunction} from "express";
import notificationService from "./notification.service.js";
import sendResponse from "../../utils/sendResponse.js";

const notificationController = {
    getExpired: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await notificationService.getExpiredNotifications();
            sendResponse(res, 200, "Expired notifications fetched", data);
        } catch (error) {
            next(error);
        }
    },

    setDays: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {days} = req.body;
            const result = await notificationService.updateSetting(Number(days));
            sendResponse(res, 200, "Expiry Setting updated", result);
        } catch (error) {
            next (error);
        }
    }
};

export default notificationController;