import { Router } from 'express';
import { register, activate, login } from '../controllers/index';
import handleError from '../middleware/handle.error';
import validateRegister from '../middleware/validate.register';
import validateLogin from '../middleware/validate.login';
import handleValidation from '../middleware/handle.validation';

const router = Router();

router.post(
  '/register',
  validateRegister,
  handleValidation,
  register,
  handleError
);
router.patch('/activate/:token', activate, handleError);
router.post('/login', validateLogin, handleValidation, login);

export default router;
