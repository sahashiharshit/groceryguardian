
import mongoose, { Document, Model, Schema } from "mongoose";
import type { ObjectId } from "../types/mongo";

export const STATUS = ["pending", "accepted", "rejected"] as const;
export type Status = typeof STATUS[number];

export interface IInvitation extends Document {
    sender: ObjectId;
    recipient: ObjectId;
    household: ObjectId;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}

const invitationSchema: Schema<IInvitation> = new Schema({

    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    household: { type: Schema.Types.ObjectId, ref: "Household", required: true },
    status: { type: String, enum: STATUS, default: "pending" },
},
    { timestamps: true }
);
invitationSchema.index({ recipient: 1, status: 1 });
invitationSchema.index({ recipient: 1, household: 1 }, { unique: true });

const Invitation: Model<IInvitation> = mongoose.model<IInvitation>("Invitation", invitationSchema);
export default Invitation;