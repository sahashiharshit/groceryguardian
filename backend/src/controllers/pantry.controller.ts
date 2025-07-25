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