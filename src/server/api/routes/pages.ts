import { Router } from 'express';
import { loginPage, registerPage } from '../controllers/index';

const router = Router();

router.get('/login', loginPage);
router.get('/register', registerPage);

export default router;
