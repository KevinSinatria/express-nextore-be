import Pusher from "pusher";
import {env} from "./env.js";

export const pusher = new Pusher({
    appId: env("PUSHER_APP_ID"),
    key: env("PUSHER_KEY"), 
    secret: env("PUSHER_SECRET"),
    cluster: env("PUSHER_CLUSTER"),
    useTLS: true,
});

export const sendRealtimeLog = (eventName: string, data: any ) => {
    pusher.trigger("cashier-monitoring", eventName, {
        ...data,
        time: new Date(),
    });
};