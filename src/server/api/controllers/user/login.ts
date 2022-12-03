import bcrypt from 'bcryptjs';
import { DateTime } from 'luxon';
import { encodeToken } from '../../../utils/auth.token';
import { ServerError } from '../../../utils/custom.errors';
import sql, { ConnectionPool } from 'mssql';
import type { RedisClientType } from 'redis';
import type { UserSession, LoginPayload } from '@Types';
import type { Response, NextFunction, Request } from 'express';

const { ENV } = process.env;

export default async (
  req: Request<{}, {}, LoginPayload>,
  res: Response,
  next: NextFunction
) => {
  const db: ConnectionPool = req.app.locals.db;
  const redis: RedisClientType = req.app.locals.redis;
  const { username, password } = req.body;

  try {
    const userRequest = await db
      .request()
      .input('username', sql.NVarChar, username)
      .execute('api.get_user');

    const [user] = userRequest.recordset;
    if (user === undefined) {
      throw new ServerError(50103);
    }
    const { password: hashedPassword, activated, user_id } = user;
    const correctPassword = await bcrypt.compare(password, hashedPassword);

    if (correctPassword) {
      if (activated) {
        const token = encodeToken({ user_id, username });
        const userSession: UserSession = {
          userId: user_id,
          username: username,
          state: 'IDLE',
          playingGame: null,
          watchingGame: null,
          lastActivity: DateTime.utc().toString()
        };
        await redis.json.set(`user:session:${user_id}`, '$', userSession, {
          NX: true
        });

        res
          .cookie('access_token', token, {
            httpOnly: true, // HTTP(S) and not available to client javascript
            secure: ENV === 'dev' ? false : true // HTTPS
          })
          .status(200)
          .send();
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
