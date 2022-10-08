import { validationResult } from 'express-validator';

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ validationError: errors.array() });
  } else {
    next();
  }
};

export default handleValidation;
