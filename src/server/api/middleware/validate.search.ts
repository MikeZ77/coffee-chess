import { checkSchema } from 'express-validator';

const validateSearch = checkSchema({
  minutes: {
    in: ['params'],
    isIn: {
      options: ['1+0, 5+0, 15+0'],
      errorMessage: 'Must be one of game types 1+0, 5+0 or 15+0.'
    }
  }
});

export default validateSearch;
