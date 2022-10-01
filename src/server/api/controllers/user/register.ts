import { dbPoolPromise } from '../../../index';
import sql from 'mssql';
import bcrypt from 'bcrypt';
import Logger from '../../../utils/logging.config.winston';

export default async (req, res) => {
  const { username, password, email } = req.body;
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const dbPool = await dbPoolPromise;
  const result = await dbPool
    .request()
    .input('email', sql.VarChar, email)
    .input('username', sql.VarChar, username)
    .input('password', sql.VarChar, hashedPassword)
    .execute('api.create_user');
  Logger.debug('%o', result);
  // TODO: clientResult, clientCode (Code determines what is done with this message)
  res.sendStatus(201).json({
    resultMessage: `Your user has been created. Please check ${email} to activate your account.`
  });
};
