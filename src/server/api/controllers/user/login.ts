import bcrypt from 'bcryptjs';
import { DateTime } from 'luxon';
import { encodeToken } from '../../../utils/auth.token';
import { ServerError } from '../../../utils/custom.errors';
import sql, { ConnectionPool } from 'mssql';
import type { RedisClientType } from 'redis';
import type { UserSession, LoginPayload } from '@Types';
import type { Response, NextFunction, Request } from 'express';

const { ENV, JWT_EXPIRY_HOURS } = process.env;

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
        const userSessionKey = `user:session:${user_id}`;
        const userSessionExpiry = parseInt(JWT_EXPIRY_HOURS) * 60 * 60 + 30; // Leave an extra 30 seconds as a buffer.
        const userSession: UserSession = {
          userId: user_id,
          username: username,
          state: 'IDLE',
          playingGame: null,
          observingGame: null,
          lastActivity: DateTime.utc().toString(),
          latency: []
        };
        await redis
          .multi()
          .json.set(userSessionKey, '$', userSession, { NX: true })
          .expire(userSessionKey, userSessionExpiry)
          .exec();

        res
          .cookie('access_token', token, {
            httpOnly: ENV === 'dev' ? false : true, // Not available to client javascript
            secure: ENV === 'dev' ? false : true // HTTPS only
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
