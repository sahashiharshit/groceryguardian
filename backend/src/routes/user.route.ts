import {Router} from 'express';
import * as rawUserController from '../controllers/user.controller.js';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { wrapControllers } from '../utils/wrapControllers.js';
const userController  = wrapControllers(rawUserController);
const router = Router();
// routes for user management
router.get('/getuser',authenticationMiddleware,userController.getUser);

router.get('/getHouseholdInfo',authenticationMiddleware, userController.getGroupUsersList);
router.post('/me',authenticationMiddleware,userController.updateUserInfo);
router.delete('/delete',authenticationMiddleware,userController.deleteUser);
export default router;


