export const NOTIFICATION_KINDS = ["lowStock","expiry","suggest"] as const;
export type NotificationKind = typeof NOTIFICATION_KINDS[number];

export type NotificationType = | { type: "lowStock" }
  | { type: "expiry"; expiryDate: Date }
  | { type: "suggest" };

export interface SmartNotification {
type:NotificationType;
message:string;
itemId:string;

}