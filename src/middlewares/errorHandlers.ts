import { logger } from '@/config/logger';
import { config } from '@/config/dev';
import { type ErrorRequestHandler } from 'express';
// import { sendEmailToUser } from './mail';

// Error count tracking object (in-memory)
const errorTracker: Record<string, { count: number; lastOccurred: number }> =
  {};

// Maximum allowed consecutive occurrences before sending an email
const MAX_CONSECUTIVE_ERRORS = 5;

// Function to convert error to HTML
const errorToHTML = (err: any, req: any): string => {
  return `
    <html>
      <body>
        <h1>Internal Server Error Occurred</h1>
        <p><strong>Request Path:</strong> ${req.path}</p>
        <p><strong>HTTP Method:</strong> ${req.method}</p>
        <p><strong>Status Code:</strong> ${err.statusCode || 500}</p>
        <p><strong>Message:</strong> ${err.message || 'Something went wrong'}</p>
        <p><strong>Stack Trace:</strong><pre>${err.stack}</pre></p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      </body>
    </html>
  `;
};

// Function to track and check if an error should trigger an email
const shouldSendEmail = (err: any): boolean => {
  const errorKey = err.stack || err.message; // Use stack trace or message as the identifier
  const currentTime = Date.now();

  if (!errorTracker[errorKey]) {
    // Initialize error entry if it doesn't exist
    errorTracker[errorKey] = { count: 1, lastOccurred: currentTime };
  } else {
    // Increment count if error exists and occurred recently
    const { count, lastOccurred } = errorTracker[errorKey];
    const timeElapsed = currentTime - lastOccurred;

    // Reset count if last occurrence was long ago (e.g., 1 hour)
    if (timeElapsed > 3600000) {
      errorTracker[errorKey].count = 1;
    } else {
      errorTracker[errorKey].count = count + 1;
    }

    errorTracker[errorKey].lastOccurred = currentTime;

    // Send email if the error occurred consecutively MAX_CONSECUTIVE_ERRORS times
    if (errorTracker[errorKey].count >= MAX_CONSECUTIVE_ERRORS) {
      errorTracker[errorKey].count = 0; // Reset count after sending email
      return true;
    }
  }

  return false;
};

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
