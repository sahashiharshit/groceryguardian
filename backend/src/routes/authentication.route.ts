

import {Router} from 'express';
import * as rawAuthController from '../controllers/autentication.controller.js';
import { validateLogin, validateRegister } from '../validators/auth.validator.js';
import { wrapControllers } from '../utils/wrapControllers.js';

const authController = wrapControllers(rawAuthController);

const router = Router();

// routes for authentication
router.post('/login', validateLogin,authController.login);
router.post('/register',validateRegister,authController.register);
router.post('/refresh',authController.refreshToken);

export default router;


