import CustomException from '@/exceptions/CustomException';
import { StatusCodes } from 'http-status-codes';

export class NoTokenException extends CustomException {
  statusCode = StatusCodes.UNAUTHORIZED;

  constructor(message: string | null = null) {
    super(message ?? 'Authentocation Required');

    Object.setPrototypeOf(this, NoTokenException.prototype);
  }

  serialize(): any {
    return {
      statusCode: this.statusCode,
      message: this.message,
    };
  }
}
