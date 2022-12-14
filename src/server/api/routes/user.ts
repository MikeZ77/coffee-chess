import { Router } from 'express';
import { register, activate, login, logout, test } from '../controllers/index';
import handleError from '../middleware/handle.error';
import validateRegister from '../middleware/validate.register';
import validateLogin from '../middleware/validate.login';
import handleValidation from '../middleware/handle.validation';
import handleAuthorization from '../middleware/handle.authorization';

const router = Router();

router.post('/register', validateRegister, handleValidation, register, handleError);
router.get('/activate/:token', activate, handleError);
router.post('/login', validateLogin, handleValidation, login, handleError);
router.post('/logout', handleAuthorization, logout, handleError);
router.get('/test', handleAuthorization, test, handleError);

export default router;
