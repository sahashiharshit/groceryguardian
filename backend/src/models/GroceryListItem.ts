import mongoose, { Schema, Document, Model } from "mongoose";


export const UnitType = {
  PCS: "pcs",
  KG: "kg",
  G: "g",
  LITERS: "liters",
  ML: "ml",
  PACKS: "packs",
  DOZEN: "dozen",
  OTHER: "other",
} as const;

export const StatusType = {
  PENDING: "pending",
  PURCHASED: "purchased",
  MOVEDTOPANTRY: "movedToPantry",
} as const;
export type StatusTypeKey = keyof typeof StatusType;
export type StatusTypeValue = typeof StatusType[StatusTypeKey];

export type UnitTypeKey = keyof typeof UnitType;
export type UnitTypeValue = typeof UnitType[UnitTypeKey];


// TS Interface for a Grocery List Item
export interface IGroceryListItem extends Document {
  householdId?: Schema.Types.ObjectId | null;
  itemName: string;
  quantity: number;
  barcode?: Schema.Types.ObjectId | null;
  unit: UnitTypeValue;
  status: StatusTypeValue;
  categoryId: Schema.Types.ObjectId;
  addedBy: Schema.Types.ObjectId;
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
    barcode: {
      type: Schema.Types.ObjectId,
      ref: "Barcode",
      default: null
    },
    unit: {
      type: String,
      enum: Object.values(UnitType),
      default: UnitType.PCS,
    },
    status: {
      type: String,
      enum: Object.values(StatusType),
      default: StatusType.PENDING,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Categories",

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
groceryListItemSchema.index({ barcode: 1 });
groceryListItemSchema.index({ householdId: 1, categoryId: 1 });
// Export the model
const GroceryListItem: Model<IGroceryListItem> = mongoose.model<IGroceryListItem>(
  "GroceryListItem",
  groceryListItemSchema
);
export default GroceryListItem;
