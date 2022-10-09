import bcrypt from 'bcryptjs';
import { dbPoolPromise } from '../../..';
import sql from 'mssql';

export default async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const dbPool = await dbPoolPromise;
    const userRequest = await dbPool
      .request()
      .input('username', sql.NVarChar, username)
      .execute('api.get_user');

    const [user] = userRequest.recordset;
    const { password: hashedPassword, activated } = user;
    const correctPassword = await bcrypt.compare(password, hashedPassword);

    // if (correctPassword) {
    //   if (activated) {

    //   }
    // }
  } catch (error) {
    next(error);
  }

  // get user from database

  // compare username with password

  // Check that account is activated

  // issue token

  res.send();
};
