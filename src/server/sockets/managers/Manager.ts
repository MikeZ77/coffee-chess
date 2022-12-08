import type { Socket, Server as ioServer } from 'socket.io';
import type { RedisClientType } from 'redis';
import Logger from '@Utils/config.logging.winston';
import { SocketError } from '@Utils/custom.errors';

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
