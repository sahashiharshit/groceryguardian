import { Router } from "express";
import * as rawGroceryController from '../controllers/grocery.controller.js';
import { authenticationMiddleware } from "../middlewares/authentication.middleware.js";
import { wrapControllers } from "../utils/wrapControllers.js";

const groceryController = wrapControllers(rawGroceryController);
const router = Router();

// routes for grocery list management
// get Grocery list
router.get('/grocery-list',authenticationMiddleware,groceryController.getGrocerieslist);
// get categories
router.get('/getcategories',authenticationMiddleware,groceryController.getCategories);
// get barcode info
router.get('/barcode/:barcode',authenticationMiddleware,groceryController.getBarcodeInfo);
// add grocery item
router.post('/add-grocery',authenticationMiddleware,groceryController.addGroceries);
// move item to pantry
router.post('/movetoinventory/:itemId',authenticationMiddleware,groceryController.moveToPantry);
// delete grocery item
router.delete('/grocery-list/:itemId',authenticationMiddleware,groceryController.deleteGroceryItem);

export default router;