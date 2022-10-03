import { Router } from 'express';
import { register, activate } from '../controllers/index';
import handleError from '../middleware/handle.error';
import validateRegister from '../middleware/validate.register';

const router = Router();

router.post('/register', validateRegister, register, handleError);
router.put('/activate', activate, handleError);

export default router;
