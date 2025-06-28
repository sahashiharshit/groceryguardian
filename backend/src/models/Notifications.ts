import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for the 'type' object
interface INotificationType {
  expiry?: Date;
  lowStock?: boolean;
}

// Main Notification interface
export interface INotification extends Document {
  userId: Schema.Types.ObjectId;
  householdId: Schema.Types.ObjectId;
  type: INotificationType;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const notificationSchema: Schema<INotification> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    householdId: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: true,
    },
    type: {
      expiry: {
        type: Date,
        required: false,
      },
      lowStock: {
        type: Boolean,
        default: false,
      },
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Model export
const Notification: Model<INotification> = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

export default Notification;
