import { checkSchema } from 'express-validator';

const validateRegister = checkSchema({
  email: {
    in: ['body'],
    isEmail: { errorMessage: 'Please provide a valid email address.' },
    normalizeEmail: {}
  },
  password: {
    in: ['body'],
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
    in: ['body'],
    isLength: {
      options: { max: 12, min: 5 },
      errorMessage: 'Username must be between 5 and 12 characters.'
    },
    matches: {
      options: /^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/,
      errorMessage:
        'Only alphanumeric and _ or . non-repeating and cannot start at begining or end.'
    }
  }
});

export default validateRegister;
