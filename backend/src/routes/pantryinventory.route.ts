
import { Router } from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import * as rawPantryControllers from '../controllers/pantry.controller.js';
import { wrapControllers } from '../utils/wrapControllers.js';
const pantryController = wrapControllers(rawPantryControllers);
const router = Router();
router.get('/',authenticationMiddleware,pantryController.getPantryList);
router.delete("/:id", authenticationMiddleware, pantryController.deleteItemFromPantry);
router.put("/:id", authenticationMiddleware, pantryController.updateItemInPantry);
router.get("/check/expiry", authenticationMiddleware, pantryController.checkForStockExpiry);
router.get("/check/low-stock", authenticationMiddleware, pantryController.checkForStockQuantity);

export default router;