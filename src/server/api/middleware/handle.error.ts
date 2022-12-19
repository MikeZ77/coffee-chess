import type { ErrorRequestHandler } from 'express';
import type { ClientErrorCodes } from '@Types';
import { MSSQLError } from 'mssql';
import { ServerError } from '@Utils/custom.errors';
import Logger from '@Utils/config.logging.winston';

interface IErrorCodes {
  [index: number]: ErrorCodeMessage;
}

type ErrorCodeMessage = {
  statusCode: number;
  errorMessage: string;
  clientCode?: ClientErrorCodes;
};

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
  50103: { statusCode: 404, errorMessage: 'Username does not exist.' },
  50104: { statusCode: 400, errorMessage: 'Disconnected from game server. Please try again.' },
  // Server Error with Client Codes
  50200: {
    statusCode: 500,
    errorMessage: 'Server error searching queue.',
    clientCode: 1
  }
};

const getErrorHelper = (errorCode: number, overrideMessage?: string) => {
  /*
    If there is a client code for a given error code then return it.
    If the ServerError was thrown with a message, then use this instead of the default in errorCodes.
  */
  const { statusCode, errorMessage, clientCode } = (errorCodes as IErrorCodes)[errorCode];
  return {
    statusCode,
    errorMessage: clientCode
      ? { clientCode, message: overrideMessage ? overrideMessage : errorMessage }
      : { message: overrideMessage ? overrideMessage : errorMessage }
  };
};

const handleError: ErrorRequestHandler = (error, req, res, next) => {
  switch (true) {
    case error instanceof MSSQLError:
      if (error.number in errorCodes) {
        const { statusCode, errorMessage } = getErrorHelper(error.number);
        // Right now not client status code errors for MSSQLError
        res.status(statusCode).send(errorMessage.message);
      }
      break;
    case error instanceof ServerError:
      if (error.code in errorCodes) {
        const { statusCode, errorMessage } = getErrorHelper(error.code, error.message);
        // Only client code errors return a json body
        errorMessage.clientCode
          ? res.status(statusCode).json(errorMessage)
          : res.status(statusCode).send(errorMessage.message);
      }
      break;
    default:
      Logger.error('Unhandled error occured: %o', error);
      res.status(500).send('Server error.');
  }
};

export default handleError;
