import { Router } from "express";
import { addGroceries, deleteGroceryItem, getGrocerieslist, updateGroceriesList } from "../controllers/grocery.controller";
const router = Router();

// routes for grocery list management
router.get('/households/:id/grocery-list',getGrocerieslist);
router.post('/households/:id/grocery-list',addGroceries);
router.put('/households/:id/grocery-list/:itemId',updateGroceriesList);
router.delete('/households/:id/grocery-list/:itemId',deleteGroceryItem);

export default router;