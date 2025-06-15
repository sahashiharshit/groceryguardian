import mongoose,{Schema,Document,Model, Types} from "mongoose";

export const ROLES =["owner","admin","member"] as const;
export type Role = typeof ROLES[number];

interface IHouseholdMember{

userId:Types.ObjectId;
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
        default: "owner",
      },
    },
  ],
  
},
{timestamps:true}
);
const Household: Model<IHousehold> = mongoose.model<IHousehold>("Household", householdSchema);
export default Household;