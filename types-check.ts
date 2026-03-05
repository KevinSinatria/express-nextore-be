import { auth } from "./src/lib/auth.js";
type AppSession = typeof auth.$Infer.Session;

const testUser: AppSession["user"] = {} as any;
testUser.nonExistentField; // This will trigger an error showing testUser type
