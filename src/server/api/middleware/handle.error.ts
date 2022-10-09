import { MSSQLError } from 'mssql';
import { ServerError } from '../../utils/custom.errors';
import Logger from '../../utils/config.logging.winston';

// TODO: Include clientCode that describes how the client should handle the specific error.
const errorCodes = {
  // Database Error Codes
  50001: {
    statusCode: 409,
    errorMessage: 'Email has already been registered.'
  },
  50002: { statusCode: 409, errorMessage: 'Username is already in use.' },
  // Server Error Codes
  50100: {
    statusCode: 410,
    errorMessage: 'Activation token has expired.'
  },
  50101: { statusCode: 403, errorMessage: 'Acount has not been activated.' },
  50102: { statusCode: 401, errorMessage: 'Incorrect username or password.' }
};

const getErrorHelper = (errorCode) => {
  const statusCode = errorCodes[errorCode].statusCode;
  const errorMessage = errorCodes[errorCode].errorMessage;
  return { statusCode, errorMessage };
};

const handleError = (error, req, res, next) => {
  switch (true) {
    case error instanceof MSSQLError:
      if (error.number in errorCodes) {
        const { statusCode, errorMessage } = getErrorHelper(error.number);
        res.status(statusCode).send(errorMessage);
      }
      break;
    case error instanceof ServerError:
      if (error.code in errorCodes) {
        const { statusCode, errorMessage } = getErrorHelper(error.code);
        res.status(statusCode).send(errorMessage);
      }
      break;
    default:
      Logger.error('Unhandled error occured: %o', error);
      res.status(500).send('Server error.');
  }
};

export default handleError;
