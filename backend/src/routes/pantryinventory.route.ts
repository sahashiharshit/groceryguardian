
import { Router } from 'express';
import { authenticationMiddleware } from '../middlewares/authentication.middleware';
import { checkForStockExpiry, checkForStockQuantity, deleteItemFromPantry, getPantryList, updateItemInPantry } from '../controllers/pantry.controller';

const router = Router();
router.get('/',authenticationMiddleware,getPantryList);
router.delete("/:id", authenticationMiddleware, deleteItemFromPantry);
router.put("/:id", authenticationMiddleware, updateItemInPantry);
router.get("/check/expiry", authenticationMiddleware, checkForStockExpiry);
router.get("/check/low-stock", authenticationMiddleware, checkForStockQuantity);

export default router;