import type { Server as ioServer, Socket } from 'socket.io';
import type { RedisClientType } from 'redis';
import Logger from '@Utils/config.logging.winston';

export default async (io: ioServer, socket: Socket, redis: RedisClientType) => {
  await redis.subscribe('channel:game:new', (paring) => {
    console.log(paring);
  });
};
