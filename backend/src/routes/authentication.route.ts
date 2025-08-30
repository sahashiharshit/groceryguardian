

import {Router} from 'express';
import * as rawAuthController from '../controllers/autentication.controller.js';
import { validateLogin, validateRegister } from '../validators/auth.validator.js';
import { wrapControllers } from '../utils/wrapControllers.js';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';

const authController = wrapControllers(rawAuthController);

const router = Router();

// routes for authentication
// login
router.post('/login', validateLogin,authController.login);
// register
router.post('/register',validateRegister,authController.register);
// verify otp
router.post('/verify-otp',authController.verifySignup);
// resend otp
router.post('/resend-otp',authController.resendSignupOtp);
// refresh token
router.post('/refresh',authController.refreshToken);
// logout
router.post('/logout',authenticationMiddleware,authController.logout);
// change password
router.post('/change-password',authenticationMiddleware,authController.changePassword);
// forgot password
router.post('/forgot-password',authController.forgotPassword);
// reset password 
router.post('/reset-password',authController.resetPassword);
export default router;

