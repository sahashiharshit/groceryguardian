
import mongoose from "mongoose";

const groceryListItemSchema = new mongoose.Schema({

householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Household",
    default:null,
  },
  itemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  unit:{
  type:String,
  enum:['pcs','kg','g','liters','ml','packs','other'],
  default:'pcs',
  },
  addedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status:{
    type: String,
    enum: ["pending", "purchased"],
    default: "pending",
  },
  additonalNotes: {
  type: String,
  default: null
  },
  purchasedAt:{
  type:Date,
  default:null,
  },
  
    

},{
timestamps:true,
});


export default mongoose.model("GroceryListItem", groceryListItemSchema);