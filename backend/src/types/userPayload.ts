

import type { ObjectId } from "./mongo";

export type UserPayload = {
id:ObjectId | string;
householdId: ObjectId | null;

}