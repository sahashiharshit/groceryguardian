
import { Types } from "mongoose";
import type { SmartNotification, NotificationType } from "../types/notifications";
import PantryItem, { type IPantryItem } from "../models/PantryItem";

function isNearExpiry(expiry?: Date): expiry is Date {

    if (!expiry) return false;
    const now = new Date();
    const inThreeDays = new Date();
    inThreeDays.setDate(now.getDate() + 3);
    return expiry >= now && expiry <= inThreeDays;

}
function isSuggestionDue(purchaseDate?: Date): boolean {
    if (!purchaseDate) return false;
    const now = new Date();
    const days = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
    return days >= 14;
}

export async function generateSmartNotifications(userId: string): Promise<SmartNotification[]> {
    if (!userId || !Types.ObjectId.isValid(userId)) return [];

    const pantryItems = await PantryItem.find({ addedBy: userId, isAvailable: true }) as IPantryItem[];

    const notifications: SmartNotification[] = [];

    for (const item of pantryItems) {
        
        const { itemName, quantity, expirationDate, purchaseDate, _id } = item;

        // Low stock
        if (quantity <= 1) {
            const type: NotificationType = { type: "lowStock" };
            const idStr = String(_id);
            notifications.push({
                type,
                message: `${itemName} is running low in your pantry.`,
                itemId: idStr
            });
        }

        // Expiry alert
        if (isNearExpiry(expirationDate)) {
            const type: NotificationType = { type: "expiry", expiryDate: expirationDate };
            const idStr = String(_id);
            notifications.push({
                type,
                message: `${itemName} is expiring soon (by ${expirationDate.toLocaleDateString()}).`,
                itemId: idStr
            });
        }

        // Buy again suggestion
        if (isSuggestionDue(purchaseDate)) {
            const type: NotificationType = { type: "suggest" };
            const idStr = String(_id);
            notifications.push({
                type,
                message: `You bought ${itemName} over 2 weeks ago. Want to buy it again?`,
                itemId:idStr
                });
        }
    }

    return notifications;
}