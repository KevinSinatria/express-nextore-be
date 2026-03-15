import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import routes from "./routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import type { Request, Response } from "express";
import cors, { type CorsOptions } from "cors";
import morgan from "morgan";
import path from "path";
import YAML from "yamljs";
import type { SwaggerOptions } from "swagger-ui-express";
import swaggerUi from "swagger-ui-express";
import basicAuth from "express-basic-auth";
import { env } from "./config/env.js";

const app = express();
const corsOptions: CorsOptions = {
  origin: "*",
  credentials: true,
};

const swaggerDocument = YAML.load(path.join(process.cwd(), "openapi.yaml"));
const swaggerOptions: SwaggerOptions = {
  customCssUrl:
    "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui.css",
  customJs: [
    "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui-bundle.js",
    "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js",
  ],
};

app.use(cors(corsOptions));

// auth handler
app.all("/api/auth/{*splat}", toNodeHandler(auth));

// middleware
app.use(morgan("dev"));
app.use(express.json());

app.use(
  "/docs",
  basicAuth({
    users: { [env("SWAGGER_USER")]: env("SWAGGER_PASSWORD") },
    challenge: true,
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, swaggerOptions),
);

// routes handler
app.use("/", routes);

// error handler
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`,
  });
});

export default app;
