import { auth } from "../lib/auth.js";

type Session = typeof auth.$Infer.Session;

declare global {
  namespace Express {
    export interface Request {
      user?: Session["userData"];
      session?: Session["session"];
    }
  }
}

declare module "cors" {
  interface CorsOptions {
    origin: string;
    credentials: boolean;
  }
}
