import { Request, Response, NextFunction } from 'express';
import {
  decodeToken,
  encodeToken,
  checkExpiration,
  TokenState
} from '../../utils/auth.token';

const { ENV } = process.env;

export default (req: Request, res: Response, next: NextFunction) => {
  const token: string = req.cookies.access_token;
  console.log(token);

  if (token === 'undefined') {
    return res.status(401).send('Unauthorized.');
  }

  try {
    const decodedToken = decodeToken(token);
    const authAction = checkExpiration(decodedToken);
    console.log('Action: ', authAction);
    console.log(decodedToken);
    switch (authAction) {
      case TokenState.ACTIVE:
        // TODO: Include user info in req.locals
        return next();
      case TokenState.EXPIRED:
        // TODO: Pass query string using encodeURIComponent for client notification.
        return res.status(401).redirect('/login.html');
      case TokenState.RENEW: {
        const { user_id, username } = decodedToken;
        const refreshedToken = encodeToken({ user_id, username });
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
