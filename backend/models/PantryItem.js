import mongoose from "mongoose";

const pantryItemSchema = new mongoose.Schema({

householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Household",
    default:null
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
  addedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  purchaseDate: {
    type: Date,
    required: false
  },
  expirationDate: {
    type: Date,
    required: false
  },
  notes: {
    type: String,
    default: ""
  },
  isAvailable:{
    type:Boolean,
    default:true
  }
  

},{timestamps:true});

export default mongoose.model("PantryItem",pantryItemSchema);