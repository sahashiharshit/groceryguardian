import mongoose, { Document, Schema, Model } from "mongoose";
import { UnitType, type UnitTypeValue } from "./GroceryListItem";


export interface IPantryItem extends Document {

  householdId?: Schema.Types.ObjectId | null;
  itemName: string;
  quantity: number;
  unit: UnitTypeValue;
  categoryId: Schema.Types.ObjectId;
  barcode?: string;
  addedBy: Schema.Types.ObjectId;
  purchaseDate?: Date;
  expirationDate?: Date;
  notes?: string;
  purchasedBy: Schema.Types.ObjectId;
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
  unit: {
    type: String,
    enum: Object.values(UnitType),
    default: UnitType.PCS
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Categories"
  },
  barcode: {
    type: Schema.Types.ObjectId,
    ref: "Barcode",
    default: null

  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  purchaseDate: {
    type: Date,

  },
  purchasedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null
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

const PantryItem: Model<IPantryItem> = mongoose.model<IPantryItem>("PantryItem", pantryItemSchema);
export default PantryItem;