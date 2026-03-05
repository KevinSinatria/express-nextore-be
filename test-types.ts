import { auth } from "./src/lib/auth.js";
type AuthSession = typeof auth.$Infer.Session;
const x: AuthSession = {} as any;
x.userData;
x.user;
x.session;
