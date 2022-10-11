import { encode, decode } from 'jwt-simple';
import { DateTime } from 'luxon';
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
    throw error;
  }
};

export enum TokenState {
  RENEW,
  EXPIRED,
  ACTIVE
}

export const checkExpiration = (partialSession) => {
  const { expires } = partialSession;
  const timeRemaining = DateTime.fromISO(expires)
    .diff(DateTime.now(), 'minute')
    .toObject();
  if (timeRemaining.minutes < 0) {
    return TokenState.EXPIRED;
  } else if (timeRemaining.minutes > 15) {
    return TokenState.ACTIVE;
  } else {
    return TokenState.RENEW;
  }
};
