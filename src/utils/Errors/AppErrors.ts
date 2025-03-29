export class AppError extends Error {
    statusCode: number; // Error status code
    status: string; // Error status message
    isOperational: boolean; // 
    
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export const handleCastErrorDB = (error: any) => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400);
  };
  
  export const handleDuplicateFieldsDB = (error: any) => {
    const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
  };
  
  export const handleValidationErrorDB = (error: any) => {
    const errors = Object.values(error.errors).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
  };
  
  export const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again!', 401);
  };
  
  export const handleJWTExpiredError = () => {
    return new AppError('Your token has expired! Please log in again.', 401);
  };