import { Router } from "express";
import * as rawGroceryController from '../controllers/grocery.controller.js';
import { authenticationMiddleware } from "../middlewares/authentication.middleware.js";
import { wrapControllers } from "../utils/wrapControllers.js";

const groceryController = wrapControllers(rawGroceryController);
const router = Router();

// routes for grocery list management
router.get('/grocery-list',authenticationMiddleware,groceryController.getGrocerieslist);
router.post('/add-grocery',authenticationMiddleware,groceryController.addGroceries);
router.delete('/grocery-list/:itemId',authenticationMiddleware,groceryController.deleteGroceryItem);
router.post('/movetoinventory/:itemId',authenticationMiddleware,groceryController.moveToPantry);
router.get('/getcategories',authenticationMiddleware,groceryController.getCategories);
router.get('/barcode/:barcode',authenticationMiddleware,groceryController.getBarcodeInfo);

export default router;