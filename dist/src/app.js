import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import routes from "./routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import cors, {} from "cors";
import morgan from "morgan";
const app = express();
const corsOptions = {
    origin: "*",
    credentials: true,
};
app.use(cors(corsOptions));
// auth handler
app.all("/api/auth/{*splat}", toNodeHandler(auth));
// middleware
app.use(express.json());
app.use(morgan("dev"));
// routes handler
app.use("/", routes);
// error handler
app.use(errorHandler);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.originalUrl} not found`,
    });
});
export default app;
//# sourceMappingURL=app.js.map