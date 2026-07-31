import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.util';
import { sendError } from '../utils/response.util';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error]:', err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Handle Multer errors or other specific errors here if needed
  if (err.name === 'MulterError') {
    return sendError(res, err.message, 400);
  }

  // Default to 500 server error
  return sendError(res, 'Internal Server Error', 500);
};
