import Logger from '../../utils/config.logging.winston';

// TODO: Include clientCode that describes how the client should handle the specific error.
const errorCodes = {
  // Database Error Codes
  50001: {
    statusCode: 409,
    errorMessage: 'Email has already been registered.'
  },
  50002: { statusCode: 409, errorMessage: 'Username is already in use.' }
  // Server Error Codes
};

const handleError = (error, req, res, next) => {
  console.log(error);

  if (errorCodes[error.number] !== 'undefined') {
    const matchedError = errorCodes[error.number];
    res.status(matchedError.statusCode).send(matchedError.errorMessage);
  } else {
    Logger.error('Unhandled error occured: %o', error);
    res.status(500).send();
  }
};

export default handleError;
