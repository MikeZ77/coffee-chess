import { checkSchema } from 'express-validator';

const validateLogin = checkSchema({
  username: {
    in: ['body'],
    errorMessage: 'Must include username.'
  },
  password: {
    in: ['body'],
    errorMessage: 'Must include password.'
  }
});

export default validateLogin;
