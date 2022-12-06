import { CustomError } from 'ts-custom-error';

export class ServerError extends CustomError {
  public constructor(public code?: number, message?: string) {
    super(message);
  }
}

export class SocketError extends CustomError {
  public constructor(public message: string) {
    super(message);
  }
}
