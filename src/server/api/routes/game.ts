import { Router } from 'express';
import { queueSearch, queueSearchCancel } from '../controllers/index';
import handleError from '../middleware/handle.error';
import handleAuthorization from '../middleware/handle.authorization';
import handleValidation from '../middleware/handle.validation';
import validateLogin from '../middleware/validate.search';

const router = Router();

router.post(
  '/search/:minutes',
  validateLogin,
  handleValidation,
  handleAuthorization,
  queueSearch,
  handleError
);
router.delete(
  '/search/:minutes',
  validateLogin,
  handleValidation,
  handleAuthorization,
  queueSearchCancel,
  handleError
);

export default router;
