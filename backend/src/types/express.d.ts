
import type { UserPayload } from "./userPayload.ts";

declare global {

    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}