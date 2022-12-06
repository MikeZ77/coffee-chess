import type { Socket } from 'socket.io';
import { decodeToken, checkExpiration, TokenState } from '@Utils/auth.token';
import { SocketError } from '@Utils/custom.errors';
import Logger from '@Utils/config.logging.winston';

type Next = (err?: SocketError | undefined) => void;

export default (socket: Socket, next: Next) => {
  const token = socket.handshake.headers.cookie?.split('=')[1];
  const clientIp = socket.handshake.address;
  if (token === undefined) {
    Logger.error(`Empty socket.io auth token for address: ${clientIp}`);
    return next(new SocketError('Error: bad authentication.'));
  }
  try {
    const decodedToken = decodeToken(token);
    const authAction = checkExpiration(decodedToken);
    const { user_id, username } = decodedToken;
    switch (authAction) {
      case TokenState.ACTIVE: {
        socket.data.userId = user_id;
        socket.data.username = username;
        break;
      }
      case TokenState.EXPIRED: {
        Logger.warning(`User: ${user_id} expired token: ${token}`);
        return next(new SocketError('Expired session. Please login again.'));
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      Logger.error(`Socket authentication error ${error.message}: ${error.stack}`);
      return next(new SocketError('Server error.'));
    }
  }
  next();
};
