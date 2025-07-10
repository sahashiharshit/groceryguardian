
import { Router } from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware';
import * as rawPantryControllers from '../controllers/pantry.controller';
import { wrapControllers } from '../utils/wrapControllers';
const pantryController = wrapControllers(rawPantryControllers);
const router = Router();
router.get('/',authenticationMiddleware,pantryController.getPantryList);
router.delete("/:id", authenticationMiddleware, pantryController.deleteItemFromPantry);
router.put("/:id", authenticationMiddleware, pantryController.updateItemInPantry);
router.get("/check/expiry", authenticationMiddleware, pantryController.checkForStockExpiry);
router.get("/check/low-stock", authenticationMiddleware, pantryController.checkForStockQuantity);

export default router;