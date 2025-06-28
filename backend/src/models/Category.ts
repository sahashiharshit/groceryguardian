import mongoose, { Model, Schema, type Document } from "mongoose";

export interface ICategory extends Document{

name:string;
createdAt:Date;
updatedAt:Date;

}

const categorySchema: Schema<ICategory> = new Schema({
name:{
type:String,
unique:true
}

},{timestamps:true});

const Categories:Model<ICategory> = mongoose.model<ICategory>("Categories",categorySchema);
export default Categories;