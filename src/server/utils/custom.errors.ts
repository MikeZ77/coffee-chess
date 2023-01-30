import { CustomError } from 'ts-custom-error';

export class ServerError extends CustomError {
  public constructor(public code?: number, overrideMessage?: string) {
    super(overrideMessage);
  }
}

export class SocketError extends CustomError {
  public details: Object | undefined;
  public constructor(public message: string, details?: Object) {
    super(message);
    if (details) {
      this.details = details;
    }
  }
}
