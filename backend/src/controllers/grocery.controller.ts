import type { Request, Response } from "express";
import GroceryListItem from "../models/GroceryListItem.js";
import PantryItem from "../models/PantryItem.js";
import User from "../models/User.js";
import Categories from "../models/Category.js";
type AddGroceryItem = {
  itemname: string;
  quantity: number;
  unit: string;
  category?: string;
  notes?: string;

}
type AddGroceryRequestBody = {
  items: AddGroceryItem[];

}
export const addGroceries = async (req: Request<{}, {}, AddGroceryRequestBody>, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: "No items provided" });
    return
  }
  const docs = items.map((item) => ({
    itemName: item.itemname,
    quantity: Number(item.quantity),
    unit: item.unit || "",
    addedBy: userId,
    notes: item.notes || undefined,
  }));

  await GroceryListItem.insertMany(docs);
  res.status(200).json({ message: "Item added to grocery list" })
};
//
export const getGrocerieslist = async (req: Request, res: Response): Promise<void> => {

  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const user = await User.findById(userId).lean();
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  const filter = user.household
    ? { householdId: user.household } // Group groceries
    : { addedBy: user._id, householdId: null }; // Solo 
  const groceries = await GroceryListItem.find(filter).lean();
  
  res.status(200).json({ groceries });
};

//

export const updateGroceriesList = async (req: Request, res: Response) => {

};

//delete items
export const deleteGroceryItem = async (req: Request, res: Response): Promise<void> => {
  const userid = req.user?.id;
  if (!userid) {
    res.status(300).json({ error: "Unauthorized" });
    return
  }
  const id = req.params?.itemId;
  
  if (!id) {
    res.status(400).json({ error: "No id available" });
    return
  }

  const item = await GroceryListItem.findOne({ _id: id, addedBy: userid });
  if (!item) {
    res.status(404).json({ message: "Item not found or unauthorized" });
    return
  }
  await GroceryListItem.deleteOne({ _id: id });
  res.status(200).json({ message: "Item deleted successfully" });
};


export const moveToPantry = async (req: Request, res: Response): Promise<void> => {
  const groceryItemId = req.params?.itemId;
  const groceryItem = await GroceryListItem.findById({ _id: groceryItemId });
  if (!groceryItem) {

    res.status(404).json({ error: "no item found" });
    return;
  }
  const pantryItem = new PantryItem({
    householdId: groceryItem?.householdId,
    itemName: groceryItem?.itemName,
    quantity: groceryItem?.quantity,
    unit: groceryItem?.unit,
    addedBy: groceryItem?.addedBy,
    purchaseDate: groceryItem?.purchasedAt || new Date(),
  });

  await pantryItem.save();
  await GroceryListItem.findByIdAndDelete(groceryItemId);
  res.status(200).json({ message: "Successfully moved to inventory" });
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {

  const categories = await Categories.find();
  res.status(200).json( categories );

}