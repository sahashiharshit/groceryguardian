
import mongoose, { Model, Schema, Document } from "mongoose";
import type { ObjectId } from "../types/mongo";
export interface IBarcode extends Document {
    code: string;
    itemName: string;
    categoryId?: ObjectId | {_id:ObjectId;name:string};
    unit: string;
    defaultQuantity: number;
    createdAt: Date;
    updatedAt: Date;
}

const barcodeSchema: Schema<IBarcode> = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    itemName: { type: String, required: true },
    unit: { type: String, required: true },
    defaultQuantity: { type: Number, default: 1 },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Categories"
    },
},
    { timestamps: true });
const Barcode: Model<IBarcode> = mongoose.model<IBarcode>("Barcode", barcodeSchema);
export default Barcode;