
import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
    name: string;
    email: string;
    mobileNo?: string;
    password: string;
    household?: mongoose.Types.ObjectId | null;
    comparePassword(candidatePassword: string): Promise<boolean>;
    createdAt:Date;
    updatedAt:Date;

}


const userSchema:Schema<IUser> = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNo: { type: String, unique: true },
    password: { type: String, required: true },
    household: {
        type: Schema.Types.ObjectId,
        ref: "Household",
        default: null
    },

}, { timestamps: true });

userSchema.pre<IUser>("save", async function () {
    if (this.isModified("password")) {
        // Hash the password before saving

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    

});
userSchema.methods.comparePassword = async function (candidatePassword:string):Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;