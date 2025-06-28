
import mongoose, { Model, Schema, Document, Types } from "mongoose";
export interface IBarcode extends Document {
    barcode: string;
    name: string;
    categoryId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const barcodeSchema: Schema<IBarcode> = new Schema({
    barcode: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    categoryId: {
        type: Types.ObjectId,
        ref: "Categories"
    },
},
    { timestamps: true });
const Barcode: Model<IBarcode> = mongoose.model<IBarcode>("Barcode", barcodeSchema);
export default Barcode;