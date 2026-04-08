import express from "express";
import notificationController from "./notification.controller.js";
import {isAuthenticated, authorizeRole} from "../../middlewares/auth.middleware.js";

const notificationRoute = express.Router();

notificationRoute.use(isAuthenticated);

notificationRoute.get("/expired", notificationController.getExpired);

notificationRoute.post("/setting", authorizeRole(["ADMIN"]), notificationController.setDays);

export default notificationRoute;