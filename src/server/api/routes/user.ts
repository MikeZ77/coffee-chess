import { Router } from 'express';
import { register } from '../controllers/index';

const router = Router();

router.post('/register', register);

export default router;
