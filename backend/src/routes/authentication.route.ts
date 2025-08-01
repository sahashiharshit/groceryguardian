

import {Router} from 'express';
import * as rawAuthController from '../controllers/autentication.controller.js';
import { validateLogin, validateRegister } from '../validators/auth.validator.js';
import { wrapControllers } from '../utils/wrapControllers.js';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';

const authController = wrapControllers(rawAuthController);

const router = Router();

// routes for authentication
router.post('/login', validateLogin,authController.login);
router.post('/register',validateRegister,authController.register);
router.post('/refresh',authController.refreshToken);
router.post('/logout',authenticationMiddleware,authController.logout);
export default router;


