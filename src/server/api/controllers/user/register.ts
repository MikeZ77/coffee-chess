import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import transporter from '../../../utils/config.mailer';
import { v4 as uuidv4 } from 'uuid';
import sql, { ConnectionPool } from 'mssql';
import { RedisClientType } from 'redis';

const { EMAIL_USERNAME, SERVER_FQDN, API_VERSION, DEFAULT_RATING } = process.env;

export default async (req: Request, res: Response, next: NextFunction) => {
  const db: ConnectionPool = req.app.locals.db;
  const redis: RedisClientType = req.app.locals.redis;
  const { username, password, email } = req.body;
  const saltRounds = 10;
  const activationToken = uuidv4();
  const activationTokenExpirySeconds = 60 * 30;
  const defaultRating = parseInt(DEFAULT_RATING);

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await db
      .request()
      .input('email', sql.NVarChar, email)
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, hashedPassword)
      .input('default_rating', sql.Int, defaultRating)
      .output('user_id', sql.UniqueIdentifier)
      .execute('api.create_user');

    const user_id = result.output.user_id;

    redis.set(`user:activation:${activationToken}`, user_id, {
      EX: activationTokenExpirySeconds
    });

    // TODO: Create a better email template.
    await transporter.sendMail({
      from: EMAIL_USERNAME,
      to: email,
      subject: 'Activate your Coffee Chess Account',
      html: `<p>Hi ${username}. Activate your account by heading to this 
             <a href="${SERVER_FQDN}/api/${API_VERSION}/user/activate/${activationToken}" target="_blank"> LINK.</a></p>
             <p>The new account will expire if it is not activated in the next ${
               activationTokenExpirySeconds / 60
             } minutes.</p>`
    });

    res.status(201).json({
      message: `Your user has been created. Please check ${email} to activate your account.`
    });
  } catch (error) {
    next(error);
  }
};
