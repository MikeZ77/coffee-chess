import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ validationError: errors.array() });
  } else {
    next();
  }
};

export default handleValidation;
