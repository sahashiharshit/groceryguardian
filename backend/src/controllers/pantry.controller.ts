import type { Request, Response } from "express"
import PantryItem from "../models/PantryItem.js"
import User from "../models/User.js";

export const getPantryList = async (req: Request, res: Response): Promise<void> => {

  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  let pantryItems;
  if (user.householdId) {
    pantryItems = await PantryItem.find({ householdId: user.householdId }).sort({ createdAt: -1 }).populate("categoryId","name");
  } else {

    pantryItems = await PantryItem.find({ addedBy: user._id, householdId: null }).sort({ createdAt: -1 }).populate("categoryId","name");
  }

  res.status(200).json(pantryItems);


}

export const deleteItemFromPantry = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const item = await PantryItem.findOneAndDelete({ _id: id, addedBy: req.user?.id });

  if (!item) {
    res.status(404).json({ message: "Item not found or not authorized." });
    return;
  }

  res.json({ message: "Item deleted successfully." });
}; 


export const updateItemInPantry = async (req: Request, res: Response): Promise<void> => {

  const { id } = req.params;
  const updates = req.body;

  const updatedItem = await PantryItem.findOneAndUpdate(
    { _id: id, addedBy: req.user?.id },
    updates,
    { new: true }
  );

  if (!updatedItem) {
    res.status(404).json({ message: "Item not found or not authorized." });
    return;
  }

  res.json(updatedItem);

};

export const checkForStockExpiry = async (req: Request, res: Response): Promise<void> => {

  const now = new Date();

  const expiredItems = await PantryItem.find({
    addedBy: req.user?.id,
    expirationDate: { $lte: now },
    isAvailable: true,
  });

  res.json(expiredItems);

};
export const checkForStockQuantity = async (req: Request, res: Response): Promise<void> => {

  const threshold = Number(req.query.threshold) || 1;

  const lowStockItems = await PantryItem.find({
    addedBy: req.user?.id,
    quantity: { $lte: threshold },
    isAvailable: true,
  });

  res.json(lowStockItems);

};

export const addGroceryToPantry = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  const items = req.body.items;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: "No items provided." });
    return;
  }
  console.log(items);
  const itemsToAdd = items.map((item: any) => ({
    itemName: item.itemname,
    quantity: item.quantity,
    unit: item.unit,
    categoryId: item.category || null,
    purchaseDate: new Date(),
    expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
    barcode: item.barcode || null,
    notes: item.notes || "",
    addedBy: user._id,
    householdId: user.householdId || null,
    isAvailable: true,
  }));
  console.log(itemsToAdd)
  try {
    const createdItems = await PantryItem.insertOne(itemsToAdd);
    res.status(201).json(createdItems);
  } catch (error) {
    res.status(500).json({ message: "Error adding items.", error });
    console.log(error);
  }
};