import mongoose,{Schema,Document,Model} from "mongoose";
import type { ObjectId } from "../types/mongo";

export const ROLES =["owner","member"] as const;
export type Role = typeof ROLES[number];

interface IHouseholdMember{

userId:ObjectId;
role:Role;
}
export interface IHousehold extends Document{
name:string;
members:IHouseholdMember[];
createdAt:Date;
updatedAt:Date;

}


const householdSchema:Schema<IHousehold> = new Schema({
  name: { type: String, required: true },
  members: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum:ROLES,
        default: "owner",
      },
    },
  ],
  
},
{timestamps:true}
);
householdSchema.index({ "members.userId": 1 });
const Household: Model<IHousehold> = mongoose.model<IHousehold>("Household", householdSchema);
export default Household;