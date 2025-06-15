import {Router} from 'express';


const router = Router();

router.get('/users/:id/notifications');
router.put('/users/:id/notifications/:notificationId');

export default router;