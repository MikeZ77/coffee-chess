import { Request, Response, NextFunction } from 'express';
import sql from 'mssql';
import bcrypt from 'bcryptjs';
import transporter from '../../../utils/config.mailer';
import { v4 as uuidv4 } from 'uuid';

const { EMAIL_USERNAME, BASE_URL, API_VERSION } = process.env;

export default async (req: Request, res: Response, next: NextFunction) => {
  const { username, password, email } = req.body;
  const saltRounds = 10;
  const activationToken = uuidv4();
  const activationTokenExpiry = 60 * 30;

  try {
    const db = req.app.locals.db;
    const redis = req.app.locals.redis;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await db
      .request()
      .input('email', sql.NVarChar, email)
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, hashedPassword)
      .output('user_id', sql.UniqueIdentifier)
      .execute('api.create_user');

    const user_id = result.output.user_id;

    redis.set(`user:activation:${activationToken}`, user_id, {
      EX: activationTokenExpiry
    });

    // TODO: Create a better email template.
    await transporter.sendMail({
      from: EMAIL_USERNAME,
      to: email,
      subject: 'Activate your Coffee Chess Account',
      html: `<p><a href="${BASE_URL}${API_VERSION}/activate/${activationToken}">Activate your account</a></p>
             <p>The new account will expire if it is not activated in the next ${
               activationTokenExpiry / 60
             } minutes</p>`
    });

    res.status(201).json({
      resultMessage: `Your user has been created. Please check ${email} to activate your account.`
    });
  } catch (error) {
    next(error);
  }
};
