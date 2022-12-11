import type { Socket, Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import { decodeToken, checkExpiration, TokenState } from '@Utils/auth.token';
import { SocketError } from '@Utils/custom.errors';
import Logger from '@Utils/config.logging.winston';

type Next = (err?: SocketError | undefined) => void;

export default class Manager {
  protected io;
  protected socket;
  protected redis;
  protected userId;
  protected username;
  constructor(io: ioServer, socket: Socket, redis: RedisClientType) {
    this.io = io;
    this.socket = socket;
    this.redis = redis;
    this.userId = socket.data.userId;
    this.username = socket.data.username;
  }

  protected getUserSignature(): string {
    return `${this.userId}::${this.username}`;
  }

  static authMiddleware(socket: Socket, next: Next): void {
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
          socket.data.userSession = `user:session:${user_id}`;
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
  }

  protected async getRedis(key: string, values: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.redis.json
        .get(key, {
          path: values
        })
        .then((gameId) => {
          if (gameId) {
            resolve(<string>gameId);
          } else {
            reject(new SocketError('Null redis response.'));
            Logger.warning(`Game ready signal for no game ${this.getUserSignature()}`);
          }
        });
    });
  }
}
