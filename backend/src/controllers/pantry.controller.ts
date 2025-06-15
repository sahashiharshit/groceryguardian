import type { Request, Response } from "express"
import PantryItem from "../models/PantryItem.js"

export const getPantryList = async(req:Request,res:Response):Promise<void>=>{
    try {
        const items = await PantryItem.find({addedBy:req.user?.id}).sort({createdAt:-1});
        res.json(items);
    } catch (error) {
        console.error("Error fetching pantry list:", error);
    res.status(500).json({ message: "Failed to fetch pantry items." });
    }

}

export const deleteItemFromPantry = async(req:Request,res:Response):Promise<void>=>{
try {
    const { id } = req.params;

    const item = await PantryItem.findOneAndDelete({ _id: id, addedBy: req.user?.id });

    if (!item) {
       res.status(404).json({ message: "Item not found or not authorized." });
       return;
    }

    res.json({ message: "Item deleted successfully." });
  } catch (error) {
    console.error("Error deleting pantry item:", error);
    res.status(500).json({ message: "Failed to delete item." });
  }

}
export const updateItemInPantry = async(req:Request,res:Response):Promise<void> =>{
try {
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
  } catch (error) {
    console.error("Error updating pantry item:", error);
    res.status(500).json({ message: "Failed to update item." });
  }
};

export const checkForStockExpiry = async(req:Request,res:Response):Promise<void> =>{
 try {
    const now = new Date();

    const expiredItems = await PantryItem.find({
      addedBy: req.user?.id,
      expirationDate: { $lte: now },
      isAvailable: true,
    });

    res.json(expiredItems);
  } catch (error) {
    console.error("Error checking for expired stock:", error);
    res.status(500).json({ message: "Failed to check expired items." });
  }
}
export const checkForStockQuantity = async(req:Request,res:Response):Promise<void> =>{
try {
    const threshold = Number(req.query.threshold) || 1;

    const lowStockItems = await PantryItem.find({
      addedBy: req.user?.id,
      quantity: { $lte: threshold },
      isAvailable: true,
    });

    res.json(lowStockItems);
  } catch (error) {
    console.error("Error checking stock quantity:", error);
    res.status(500).json({ message: "Failed to check stock quantity." });
  }
}