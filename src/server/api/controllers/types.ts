import type { ConnectionPool } from 'mssql';
import type { RedisClientType } from 'redis';
import type { Application, Request as ERequest } from 'express';

type Locals = {
  db: ConnectionPool;
  redis: RedisClientType;
};

interface IApplication extends Application {
  locals: Locals;
}

export interface IRequest extends ERequest {
  app: IApplication;
}
