import { Router } from 'express';
import { health } from '../controllers/index';

const router = Router();

router.get('/', health);

export default router;
