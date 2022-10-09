import { encode, decode } from 'jwt-simple';
import { DateTime } from 'luxon';
import { ServerError } from './custom.errors';
import Logger from './config.logging.winston';

const { JWT_SECRET, JWT_EXPIRY_HOURS } = process.env;

export const encodeToken = (partialSession) => {
  const currentTime = DateTime.now();
  const issued = currentTime.toString();
  const expires = currentTime
    .plus({ hours: parseInt(JWT_EXPIRY_HOURS) })
    .toString();
  const session = { ...partialSession, issued, expires };
  return encode(session, JWT_SECRET);
};

export const decodeToken = (token) => {
  try {
    return decode(token, JWT_SECRET);
  } catch (error) {
    // TODO: Include details about the session.
    Logger.warn(error.message);
    // throw new ServerError();
  }
};

enum TokenAction {
  RENEW,
  EXPIRED,
  ACTIVE
}

export const checkExpiration = (partialSession) => {
  const { expiry } = partialSession;
  const timeRemaining = DateTime.fromISO(expiry)
    .diff(DateTime.now(), 'minute')
    .toObject();
  if (timeRemaining.minutes < 0) {
    return TokenAction.EXPIRED;
  } else if (timeRemaining.minutes > 15) {
    return TokenAction.ACTIVE;
  } else {
    return TokenAction.RENEW;
  }
};
