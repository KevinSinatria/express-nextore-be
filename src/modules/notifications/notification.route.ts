import express from "express";
import notificationController from "./notification.controller.js";
import {isAuthenticated, authorizeRole} from "../../middlewares/auth.middleware.js";

const notificationRoute = express.Router();

notificationRoute.use(isAuthenticated);

notificationRoute.get("/expired", notificationController.getExpiredList);

notificationRoute.post("/trigger-test", notificationController.triggerExpiryCheck);

notificationRoute.get("/inbox", notificationController.getInbox);

notificationRoute.patch("/inbox/readAll", notificationController.markAllRead);

notificationRoute.patch("/inbox/:id/read", notificationController.markRead);

notificationRoute.delete("/inbox/:id", notificationController.remove);

notificationRoute.post("/setting", authorizeRole(["ADMIN"]), notificationController.setDays);

export default notificationRoute;