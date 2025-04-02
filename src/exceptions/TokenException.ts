import CustomException from '@/exceptions/CustomException';
import { StatusCodes } from 'http-status-codes';

export class TokenException extends CustomException {
  statusCode = StatusCodes.UNAUTHORIZED;

  constructor(message: string | null = null) {
    super(message ?? 'Token Not Found');

    Object.setPrototypeOf(this, TokenException.prototype);
  }

  serialize(): any {
    return {
      statusCode: this.statusCode,
      message: this.message,
    };
  }
}
