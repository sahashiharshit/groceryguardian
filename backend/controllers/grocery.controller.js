import GroceryListItem from "../models/GroceryListItem.js";
import PantryItem from "../models/PantryItem.js";

export const addGroceries = async (req, res) => {
  const userId = req.user._id;
  const householdId = req.user.householdId || null;
  const { itemName, quantity, additionalNotes = "" } = req.body;

  const newGrocery = new GroceryListItem({
    householdId,
    itemName,
    quantity,
    unit,
    addedBy: userId,
    additionalNotes,
  });

  await newGrocery.save();
  res.status(200).json({message:"Item added to grocery list"})
};

export const getGrocerieslist = async (req, res) => {

const filter = req.user.householdId?{householdId:req.user.householdId}:{addedBy:req.user._id,householdId:null};
const groceries = await GroceryListItem.find({...filter,status:'pending'});
res.status(200).json({groceries});
};

export const updateGroceriesList = async (req, res) => {

};

export const deleteGroceryItem = async (req, res) => {


};


export const moveToPantry = async(req,res)=>{
const groceryItemId = req.body;
const groceryItem = await GroceryListItem.findById(groceryItemId);
if(!groceryItem || groceryItem.status !== 'purchased'){

  res.status(404).json({error:"no item found"});
}
const pantryItem = new PantryItem({
householdId:groceryItem.householdId,
itemName:groceryItem.name,
quantity:groceryItem.quantity,
unit:groceryItem.unit,
addedBy:groceryItem.addedBy,
purchaseDate:groceryItem.purchasedAt || new Date(),
});

  await pantryItem.save();
  await GroceryListItem.findByIdAndDelete(groceryItemId);
};
