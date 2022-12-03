import { CustomError } from 'ts-custom-error';

export class ServerError extends CustomError {
  public constructor(public code?: number, message?: string) {
    super(message);
  }
}
