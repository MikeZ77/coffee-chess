import { Router } from 'express';
import { loginPage, registerPage, gameLobbyPage } from '../controllers/index';
import handleAuthorization from '../middleware/handle.authorization';

const router = Router();

router.get('/login', loginPage);
router.get('/register', registerPage);
router.get('/', handleAuthorization, gameLobbyPage);

export default router;
