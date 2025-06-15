import {Router} from 'express';
import * as rawUserController from '../controllers/user.controller.js';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { wrapControllers } from '../utils/wrapControllers.js';
const userController  = wrapControllers(rawUserController);
const router = Router();
// routes for user management
router.get('/getuser',authenticationMiddleware,userController.getUser);
router.post('/household/:id/create',userController.createGroup);
router.get('/getHouseholdInfo',authenticationMiddleware, userController.getGroupUsersList);

export default router;


