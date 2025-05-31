import {Router} from 'express';

const router =Router();



// routes for household management

router.post('/households');
router.get('/households/:id');
router.put('/households/:id/members/:userId');
router.delete('/households/:id/members/:userId');

export default router;