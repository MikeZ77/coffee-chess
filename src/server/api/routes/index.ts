import { Router } from 'express';
import user from './user';
import health from './health';
import pages from './pages';

const router = Router();

router.use('/', pages);
router.use('/user', user);
router.use('/health', health);

export default router;
