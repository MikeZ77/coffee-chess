import { Router } from 'express';
import user from './user';
import health from './health';
import pages from './pages';

const apiRouter = Router();
const pageRouter = Router();

pageRouter.use('/', pages);
apiRouter.use('/user', user);
apiRouter.use('/health', health);

export default { apiRouter, pageRouter };
