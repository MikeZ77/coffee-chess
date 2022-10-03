import { redisClientPromise, dbPoolPromise } from '../../../index';
import sql from 'mssql';
import bcrypt from 'bcryptjs';
import transporter from '../../../utils/config.mailer';
import { v4 as uuidv4 } from 'uuid';
import Logger from '../../../utils/config.logging.winston';

const { EMAIL_USERNAME, BASE_URL, API_VERSION } = process.env;

export default async (req, res, next) => {
  const { username, password, email } = req.body;
  const saltRounds = 10;
  const activationToken = uuidv4();
  const activationTokenExpiry = 60 * 30;

  try {
    const redisClient = await redisClientPromise;
    redisClient.set(email, activationToken, { EX: activationTokenExpiry });

    // TODO: Create a better email template.
    await transporter.sendMail({
      from: EMAIL_USERNAME,
      to: email,
      subject: 'Activate your Coffee Chess Account',
      html: `<p>Activate your account: <a href="${BASE_URL}${API_VERSION}/activate/${activationToken}"></p>
             <p>The new account will expire if it is not activated in the next ${activationTokenExpiry} minutes</p>`
    });

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const dbPool = await dbPoolPromise;
    await dbPool
      .request()
      .input('email', sql.VarChar, email)
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, hashedPassword)
      .execute('api.create_user');

    res.status(201).json({
      resultMessage: `Your user has been created. Please check ${email} to activate your account.`
    });
  } catch (error) {
    next(error);
  }
};
