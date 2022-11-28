import type { ErrorRequestHandler } from 'express';
import { MSSQLError } from 'mssql';
import { ServerError } from '../../utils/custom.errors';
import Logger from '../../utils/config.logging.winston';

interface IErrorCodes {
  [index: number]: ErrorCodeMessage;
}

type ErrorCodeMessage = {
  statusCode: number;
  errorMessage: string;
};

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
  50102: { statusCode: 401, errorMessage: 'Incorrect username or password.' },
  50103: { statusCode: 404, errorMessage: 'Username does not exist.' }
};

const getErrorHelper = (errorCode: number) => {
  const { statusCode, errorMessage } = (errorCodes as IErrorCodes)[errorCode];
  return { statusCode, errorMessage };
};

const handleError: ErrorRequestHandler = (error, req, res, next) => {
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
