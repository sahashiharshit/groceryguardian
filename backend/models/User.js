
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
 name:{type:String, required: true},
 email:{type: String, required: true, unique: true},
 mobileNo:{type:String,unique:true},
 password:{type: String, required: true},
 households:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Household" ,
    default:null
 }],
    
},{timestamps:true}); 
 
 userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        // Hash the password before saving
        
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
 
 });
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}
export default mongoose.model("User", userSchema);