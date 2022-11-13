import { checkSchema } from 'express-validator';

const validateRegister = checkSchema({
  email: {
    isEmail: { errorMessage: 'Please provide a valid email address.' },
    normalizeEmail: {}
  },
  password: {
    isStrongPassword: {
      options: {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1
      },
      errorMessage:
        'Password must have a minimum length of 8, and have at least one number, symbol, uppercase and lowercase.'
    },
    isLength: {
      options: { max: 16 },
      errorMessage: 'Password must have a maximum length of 16.'
    }
  },
  username: {
    isLength: {
      options: { max: 12, min: 5 },
      errorMessage:
        'Username must have a maximum length of 12 and minimum length of 5.'
    },
    isAlphanumeric: {
      errorMessage: 'Only numbers and digits are allowed in usernames.'
    }
  }
});

export default validateRegister;
