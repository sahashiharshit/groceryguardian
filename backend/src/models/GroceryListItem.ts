import mongoose, { Schema, Document, Model, Types } from "mongoose";


export const UnitType = {
  PCS : "pcs",
  KG : "kg",
  G :"g",
  LITERS : "liters",
  ML : "ml",
  PACKS : "packs",
  OTHER : "other",
} as const;


export type UnitTypeKey = keyof typeof UnitType;
export type UnitTypeValue = typeof UnitType[UnitTypeKey];


// TS Interface for a Grocery List Item
export interface IGroceryListItem extends Document {
  householdId?: Types.ObjectId | null;
  itemName: string;
  quantity: number;
  unit: UnitTypeValue;
  barcode:string;
  addedBy: Types.ObjectId;
  notes?: string | null;
  purchasedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const groceryListItemSchema: Schema<IGroceryListItem> = new Schema(
  {
    householdId: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      default: null,
    },
    itemName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    unit: {
      type: String,
      enum: Object.values(UnitType),
      default: UnitType.PCS,
    },
    barcode:{
    type:String,
    default:null  
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  
    notes: {
      type: String,
      default: null,
    },
    purchasedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Export the model
const GroceryListItem: Model<IGroceryListItem> = mongoose.model<IGroceryListItem>(
  "GroceryListItem",
  groceryListItemSchema
);
export default GroceryListItem;
