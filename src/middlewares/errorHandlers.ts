import { logger } from '@/config/logger';
import { config } from '@/config/dev';
import { type ErrorRequestHandler } from 'express';

// Error handler function
const ErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const errStatus: number =
    typeof err.statusCode === 'number' ? err.statusCode : 500;
  const errMsg: string =
    typeof err.message === 'string' ? err.message : 'Something went wrong';

  logger.error(err); ///only log if server error

  res.status(errStatus).json({
    message: errStatus === 500 ? 'Internal Server Error' : errMsg,
    data: {},
    stack: config.serverEnv === 'development' ? err.stack : {},
  });
};

export default ErrorHandler;
