import path from 'path';
import { Request, Response } from 'express';

export default (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, '../../client/login.html'));
};
