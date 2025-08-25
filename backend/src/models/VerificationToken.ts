import mongoose, { Schema,Document,Model } from "mongoose";
import type { ObjectId } from "../types/mongo";
export type VerificationType = "signup" | "reset";
export interface IVerificationToken extends Document {
    userId: ObjectId;
    otp: string;
    type:VerificationType;
    createdAt: Date;
    expiresAt: Date;
    updatedAt:Date;
}

const verificationTokenSchema: Schema<IVerificationToken> = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    type:{type:String,enum:["signup","reset"],required:true,index:true},
    expiresAt: { type: Date, required: true,index:{expires:0} },
},{timestamps:true});
verificationTokenSchema.index({userId:1,type:1},{unique:true});
const VerificationToken: Model<IVerificationToken> = mongoose.model<IVerificationToken>("VerificationToken", verificationTokenSchema);
export default VerificationToken;
