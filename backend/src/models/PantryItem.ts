import mongoose, { Document, Schema, Model } from "mongoose";


export interface IPantryItem extends Document {

  householdId?: mongoose.Types.ObjectId | null;
  itemName: string;
  quantity: number;
  category?: string;
  addedBy: mongoose.Types.ObjectId;
  purchaseDate?: Date;
  expirationDate?: Date;
  notes?: string;
  isAvailable?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const pantryItemSchema: Schema<IPantryItem> = new Schema({

  householdId: {
    type: Schema.Types.ObjectId,
    ref: "Household",
    default: null
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
  category: {
    type: String,

  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  purchaseDate: {
    type: Date,

  },
  expirationDate: {
    type: Date,

  },
  notes: {
    type: String,
    default: ""
  },
  isAvailable: {
    type: Boolean,
    default: true
  }


}, { timestamps: true });

const PantryItem:Model<IPantryItem> = mongoose.model<IPantryItem>("PantryItem",pantryItemSchema);
export default PantryItem;