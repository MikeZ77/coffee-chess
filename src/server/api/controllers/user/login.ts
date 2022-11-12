import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { encodeToken } from '../../../utils/auth.token';
import { ServerError } from '../../../utils/custom.errors';
import sql from 'mssql';

const { ENV } = process.env;

export default async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body)
  const { username, password } = req.body;
  const db = req.app.locals.db;

  try {
    // TODO: If the user does not exist return the appropriate error
    const userRequest = await db
      .request()
      .input('username', sql.NVarChar, username)
      .execute('api.get_user');

    const [user] = userRequest.recordset;
    const { password: hashedPassword, activated, user_id } = user;
    const correctPassword = await bcrypt.compare(password, hashedPassword);

    if (correctPassword) {
      if (activated) {
        const token = encodeToken({ user_id, username });
        // TODO: Crate the user session.
        res
          .cookie('access_token', token, {
            httpOnly: true, // HTTP(S) and not available to client javascript
            secure: ENV === 'dev' ? false : true // HTTPS
          })
          .status(200)
          .json({}); //TODO: Redirect to main.html
      } else {
        throw new ServerError(50101);
      }
    } else {
      throw new ServerError(50102);
    }
  } catch (error) {
    next(error);
  }
};
