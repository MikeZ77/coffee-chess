import { Router } from 'express';
import { loginPage, registerPage, gameLobbyPage } from '../controllers/index';

const router = Router();

router.get('/login', loginPage);
router.get('/register', registerPage);
router.get('/', gameLobbyPage);

export default router;
