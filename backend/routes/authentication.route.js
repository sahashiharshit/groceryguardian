import {Router} from 'express';
import { login, register } from '../controllers/autentication.controller.js';
import { validateLogin, validateRegister } from '../validators/auth.validator.js';
import {asyncHandler} from '../middlewares/asyncHandler.middleware.js';

const router = Router();

// routes for authentication
router.post('/login', validateLogin,login);
router.post('/register',validateRegister,asyncHandler(register));

export default router;


