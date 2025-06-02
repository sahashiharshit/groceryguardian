import { Router } from "express";
import { addGroceries, deleteGroceryItem, getGrocerieslist, updateGroceriesList } from "../controllers/grocery.controller.js";
import { authenticationMiddleware } from "../middlewares/authentication.middleware.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
const router = Router();

// routes for grocery list management
router.get('/grocerylist',authenticationMiddleware,asyncHandler(getGrocerieslist));
router.post('/:id/grocery-list',addGroceries);
router.put('/:id/grocery-list/:itemId',updateGroceriesList);
router.delete('/:id/grocery-list/:itemId',deleteGroceryItem);

export default router;