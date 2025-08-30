import {Router} from 'express';
import * as rawUserController from '../controllers/user.controller.js';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
import { wrapControllers } from '../utils/wrapControllers.js';
const userController  = wrapControllers(rawUserController);
const router = Router();
// routes for user management
// Get user information
router.get('/getuser',authenticationMiddleware,userController.getUser);

// Get household information
router.get('/getHouseholdInfo',authenticationMiddleware, userController.getGroupUsersList);
// Update user information
router.post('/me',authenticationMiddleware,userController.updateUserInfo);
// Delete user account
router.delete('/delete',authenticationMiddleware,userController.deleteUser);
export default router;


