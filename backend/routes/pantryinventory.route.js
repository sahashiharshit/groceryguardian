
import { Router } from 'express';

const router = Router();
router.get('/households/:id/pantry');
router.post('/households/:id/pantry');
router.put('/households/:id/pantry/:itemId');
router.delete('/households/:id/pantry/:itemId');

export default router;