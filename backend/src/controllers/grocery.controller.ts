import type { Request, Response } from "express";
import GroceryListItem from "../models/GroceryListItem.js";
import PantryItem from "../models/PantryItem.js";
import User from "../models/User.js";
import Categories from "../models/Category.js";
import Barcode, { type IBarcode } from "../models/Barcode.js";
import type { ObjectId } from "../types/mongo.js";
import { withTransaction } from "../utils/transactions.js";
type AddGroceryItem = {
  itemname: string;
  quantity: number;
  unit: string;
  category?: ObjectId;
  notes?: string;
  barcode?: string;
}
type AddGroceryRequestBody = {
  items: AddGroceryItem[];

}
export const addGroceries = async (req: Request<{}, {}, AddGroceryRequestBody>, res: Response): Promise<void> => {
 await withTransaction(async (session) => {
    const userId = req.user?.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "No items provided" });
      return;
    }

    const user = await User.findById(userId).session(session);
    const householdId = user?.householdId || null;

    const docs = await Promise.all(
      items.map(async (item) => {
        let barcodeId: string | null = null;
        let categoryId: string | null = null;

        const category = await Categories.findOne({ name: item.category }).session(session);
        categoryId = category?._id?.toString() || null;

        if (item.barcode) {
          let barcode = await Barcode.findOne({ code: item.barcode }).session(session);

          if (!barcode) {
            barcode = await Barcode.create(
              [
                {
                  code: item.barcode,
                  itemName: item.itemname,
                  unit: item.unit,
                  defaultQuantity: Number(item.quantity),
                  categoryId: category?._id,
                },
              ],
              { session }
            ).then((docs) => docs[0] ?? null);
          }
          barcodeId = barcode?._id?.toString() ?? null;
        }

        return {
          itemName: item.itemname,
          quantity: Number(item.quantity),
          unit: item.unit || "",
          addedBy: userId,
          barcode: barcodeId || undefined,
          notes: item.notes || undefined,
          householdId: householdId,
          categoryId: categoryId || undefined,
        };
      })
    );

    await GroceryListItem.insertMany(docs, { session });
    res.status(200).json({ message: "Item added to grocery list" });
  });
};
//
export const getGrocerieslist = async (req: Request, res: Response): Promise<void> => {

 await withTransaction(async (session) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId).session(session).lean();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const filter = user.householdId
      ? { householdId: user.householdId }
      : { addedBy: user._id, householdId: null };

    const groceries = await GroceryListItem.find(filter).session(session).lean();
    res.status(200).json({ groceries });
  });
};


//delete items
export const deleteGroceryItem = async (req: Request, res: Response): Promise<void> => {
 await withTransaction(async (session) => {
    const userid = req.user?.id;
    if (!userid) {
      res.status(300).json({ error: "Unauthorized" });
      return;
    }

    const id = req.params?.itemId;
    if (!id) {
      res.status(400).json({ error: "No id available" });
      return;
    }

    const item = await GroceryListItem.findOne({ _id: id, addedBy: userid }).session(session);
    if (!item) {
      res.status(404).json({ message: "Item not found or unauthorized" });
      return;
    }

    await GroceryListItem.deleteOne({ _id: id }).session(session);
    res.status(200).json({ message: "Item deleted successfully" });
  });
};

//Move to inventory
export const moveToPantry = async (req: Request, res: Response): Promise<void> => {
await withTransaction(async (session) => {
    const groceryItemId = req.params?.itemId;
    const { expirationDate } = req.body;
    const userId = req.user?.id;

    if (!groceryItemId) {
      res.status(400).json({ error: "No grocery item ID provided." });
      return;
    }

    const groceryItem = await GroceryListItem.findById(groceryItemId).session(session);
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
      purchaseDate: new Date(),
      barcode: groceryItem?.barcode,
      categoryId: groceryItem?.categoryId,
      purchasedBy: userId,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
    });

    await pantryItem.save({ session });
    await GroceryListItem.findByIdAndDelete(groceryItemId).session(session);

    res.status(200).json({ message: "Successfully moved to inventory" });
  });
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {

    await withTransaction(async (session) => {
    const categories = await Categories.find().session(session);
    res.status(200).json(categories);
  });

}

export const getBarcodeInfo = async (req: Request, res: Response): Promise<void> => {

   await withTransaction(async (session) => {
    const { barcode } = req.params;

    const barcodeEntry = await Barcode.findOne({ code: barcode })
      .session(session)
      .populate("categoryId", "name");

    if (!barcodeEntry) {
      res.status(404).json({ message: "Barcode not found" });
      return;
    }

    res.json({
      id: barcodeEntry._id,
      code: barcodeEntry.code,
      itemName: barcodeEntry.itemName,
      unit: barcodeEntry.unit,
      quantity: barcodeEntry.defaultQuantity,
      category:
        typeof barcodeEntry.categoryId === "object" &&
        "name" in barcodeEntry.categoryId
          ? barcodeEntry.categoryId.name
          : "",
    });
  });
}

