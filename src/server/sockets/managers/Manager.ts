import type { Socket, Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import type { ConnectionPool } from 'mssql';
import type { ServerMessage } from '@Types';
import { decodeToken, checkExpiration, TokenState } from '@Utils/auth.token';
import { SocketError } from '@Utils/custom.errors';
import { DateTime, Interval } from 'luxon';
import Logger from '@Utils/config.logging.winston';

type Next = (err?: SocketError | undefined) => void;
const { CONNECTION_QUALITY_PING_MS = '3000' } = process.env;

export default class Manager {
  protected io;
  protected socket;
  protected redis;
  protected db;
  protected userId;
  protected username;
  constructor(io: ioServer, socket: Socket, redis: RedisClientType, db?: ConnectionPool) {
    this.io = io;
    this.socket = socket;
    this.redis = redis;
    this.db = <ConnectionPool>db;
    this.userId = socket.data.userId;
    this.username = socket.data.username;
  }

  protected getUserSignature(): string {
    return `${this.userId}::${this.username}`;
  }

  static getUserSignature(socket: Socket): string {
    const { userId } = socket.data.userId;
    const { username } = socket.data.username;
    return `${userId}::${username}`;
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
          Logger.warn(`User: ${user_id} expired token: ${token}`);
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

  static getConnectionPing = (socket: Socket, redis: RedisClientType) => {
    setInterval(() => {
      const start = DateTime.now();
      socket.emit('message:user:ping', async () => {
        try {
          // console.log(socket.connected);
          const latency = Interval.fromDateTimes(start, DateTime.now()).length('milliseconds');
          const userSession = socket.data.userSession;
          // TODO: Bug where userSession is undefined. Probably not being set when user reconnects.
          await redis.json.arrAppend(userSession, 'latency', {
            timestampUtc: DateTime.utc().toString(),
            ms: latency
          });
          const length = await redis.json.arrLen(userSession, 'latency');
          if (length > 15) {
            await redis.json.arrPop(userSession, 'latency', 0);
          }
        } catch (error) {
          if (error instanceof Error) {
            Logger.error(
              `${Manager.getUserSignature(socket)}: ${error.message} %o`,
              error.stack
            );
          }
        }
      });
    }, parseInt(CONNECTION_QUALITY_PING_MS));
  };

  static checkClientConnections = async (io: ioServer, socket: Socket) => {
    const userId = socket.data.userId;
    const allSockets = await io.fetchSockets();
    const userSockets = allSockets.filter((socket) => socket.data.userId === userId);
    if (userSockets.length > 1) {
      // Sockets are already sorted ascending by time of handshake.
      const socketToRemove = userSockets.pop();
      if (socketToRemove) {
        io.to(socketToRemove.id).emit('message:user:notification', <ServerMessage>{
          type: 'MULTIPLE_WINDOWS'
        });
        socketToRemove.disconnect();
      }
    }
  };

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
            Logger.warn(`Game ready signal for no game ${this.getUserSignature()}`);
          }
        });
    });
  }
}
