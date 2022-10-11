import bcrypt from 'bcryptjs';
import { encodeToken } from '../../../utils/auth.token';
import { ServerError } from '../../../utils/custom.errors';
import sql from 'mssql';

const { ENV } = process.env;

export default async (req, res, next) => {
  const { username, password } = req.body;
  const db = req.app.locals.db;

  try {
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
        res
          .cookie('access_token', token, {
            httpOnly: true, // HTTP(S) and not available to client javascript
            secure: ENV === 'dev' ? false : true // HTTPS
          })
          .status(200)
          .json({}); //TODO: Send inital data required for client.
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
