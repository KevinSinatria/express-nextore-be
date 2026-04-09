import app from "./app.js";
import cron from "node-cron";
import { env } from "./config/env.js";
import notificationService from "./modules/notifications/notification.service.js";

const PORT = env("PORT");

cron.schedule("0 * * * *", () => {
  console.log("Running daily expiry check..");
  notificationService.triggerRealtimeNotification();
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
