import { Router } from 'express';
import user from './user';
import health from './health';
import pages from './pages';
import game from './game';

const apiRouter = Router();
const pageRouter = Router();

pageRouter.use('/', pages);
apiRouter.use('/user', user);
apiRouter.use('/health', health);
apiRouter.use('/game', game);

export default { apiRouter, pageRouter };
