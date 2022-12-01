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

interface IRequest<T> extends ERequest {
  app: IApplication;
  body: T;
}

export type Request<T> = IRequest<T> | ERequest;
