import { Router } from 'express';
import { register, activate } from '../controllers/index';
import handleError from '../middleware/handle.error';
import validateRegister from '../middleware/validate.register';
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

export default router;
