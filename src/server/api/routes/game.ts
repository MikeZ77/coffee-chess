import { Router } from 'express';
import { queueSearch, queueSearchCancel } from '../controllers/index';
import handleError from '../middleware/handle.error';
import handleAuthorization from '../middleware/handle.authorization';

const router = Router();

router.post('/search/:minutes', handleAuthorization, queueSearch, handleError);
router.delete('/search/:minutes', handleAuthorization, queueSearchCancel, handleError);

export default router;
