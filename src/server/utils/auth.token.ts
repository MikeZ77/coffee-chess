import { encode, decode } from 'jwt-simple';
import { DateTime } from 'luxon';
import Logger from './config.logging.winston';

const { JWT_SECRET, JWT_EXPIRY_HOURS, JWT_REFRESH_INTERVAL_M } = process.env;

interface IPartialTokenSession {
  user_id: string;
  username: string;
}

interface ITokenSession extends IPartialTokenSession {
  issued: string;
  expires: string;
}

export enum TokenState {
  RENEW,
  EXPIRED,
  ACTIVE
}

export const encodeToken = (partialSession: IPartialTokenSession) => {
  const currentTime = DateTime.now();
  const issued = currentTime.toString();
  const expires = currentTime.plus({ hours: parseInt(JWT_EXPIRY_HOURS) }).toString();
  const session = { ...partialSession, issued, expires };
  return encode(session, JWT_SECRET);
};

export const decodeToken = (token: string) => {
  try {
    return decode(token, JWT_SECRET);
  } catch (error) {
    if (error instanceof Error) {
      // TODO: Include details about the session.
      Logger.warn(error.message);
      throw error;
    }
  }
};

export const checkExpiration = (session: ITokenSession) => {
  const { expires } = session;
  const refreshInterval = parseInt(JWT_REFRESH_INTERVAL_M);
  const timeRemaining = DateTime.fromISO(expires).diff(DateTime.now(), 'minute').toObject();

  if (timeRemaining.minutes == undefined) {
    return TokenState.EXPIRED;
  }
  if (timeRemaining.minutes < 0) {
    return TokenState.EXPIRED;
  } else if (timeRemaining.minutes > refreshInterval) {
    return TokenState.ACTIVE;
  } else {
    return TokenState.RENEW;
  }
};
