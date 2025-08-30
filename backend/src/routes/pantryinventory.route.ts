
import { Router } from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import * as rawPantryControllers from '../controllers/pantry.controller.js';
import { wrapControllers } from '../utils/wrapControllers.js';
const pantryController = wrapControllers(rawPantryControllers);
const router = Router();
// routes for pantry inventory management
// Get all pantry items for the authenticated user
router.get('/',authenticationMiddleware,pantryController.getPantryList);
// Check for items nearing expiry or low stock
router.get("/check/expiry", authenticationMiddleware, pantryController.checkForStockExpiry);
// Check for items with low stock quantity
router.get("/check/low-stock", authenticationMiddleware, pantryController.checkForStockQuantity);
// Add a new grocery item to the pantry
router.post("/add-grocery", authenticationMiddleware, pantryController.addGroceryToPantry);
// Update details of an existing pantry item
router.put("/:id", authenticationMiddleware, pantryController.updateItemInPantry);
// Delete a pantry item by its ID
router.delete("/:id", authenticationMiddleware, pantryController.deleteItemFromPantry);
export default router;