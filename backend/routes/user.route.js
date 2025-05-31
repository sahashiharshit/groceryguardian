import {Router} from 'express';
import { getGroupUsersList, getUser, inviteToHousehold } from '../controllers/user.controller.js';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';

const router = Router();
// routes for user management
router.get('/',authenticationMiddleware,getUser);
router.post('/households/:id/invite',inviteToHousehold);
router.get('/getHouseholdInfo',authenticationMiddleware, getGroupUsersList);

export default router;


