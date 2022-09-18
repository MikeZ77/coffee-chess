import { Router } from 'express';
import user from './user';
import health from './health';

const router = Router();

router.use('/user', user);
router.use('/health', health);

export default router;
