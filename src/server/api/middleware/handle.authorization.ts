import { Request, Response, NextFunction } from 'express';
import { decodeToken, encodeToken, checkExpiration, TokenState } from '@Utils/auth.token';

const { ENV } = process.env;

export default (req: Request, res: Response, next: NextFunction) => {
  const token: string = req.cookies.access_token;
  if (token === undefined) {
    return res.status(401).redirect('/login');
  }

  try {
    const decodedToken = decodeToken(token);
    const authAction = checkExpiration(decodedToken);
    const { user_id, username } = decodedToken;
    switch (authAction) {
      case TokenState.ACTIVE:
        req.id = user_id;
        return next();
      case TokenState.EXPIRED:
        return res.status(401).redirect('/login');
      case TokenState.RENEW: {
        req.id = user_id;
        const refreshedToken: string = encodeToken({ user_id, username });
        res.cookie('access_token', refreshedToken, {
          httpOnly: true,
          secure: ENV === 'dev' ? false : true
        });
        return next();
      }
      default:
        return res.status(401).send('Unauthorized.');
    }
  } catch (error) {
    return next(error);
  }
};
