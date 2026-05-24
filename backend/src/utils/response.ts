import { Response } from 'express';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string | null;
  status: number;
}

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): Response {
  return res.status(statusCode).json({
    data,
    error: null,
    status: statusCode,
  });
}

export function sendError(res: Response, error: string, statusCode: number = 400): Response {
  return res.status(statusCode).json({
    data: null,
    error,
    status: statusCode,
  });
}
