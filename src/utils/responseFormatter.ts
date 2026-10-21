import { Request, Response } from 'express';

export function sanitizeForJson(value: any): any {
  if (value === null || value === undefined) return value;
  const t = typeof value;
  if (t === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) return value.toString('base64');
  // Check for Prisma Decimal or Decimal.js
  if (value && typeof value === 'object' && 'd' in value && 'e' in value && 's' in value) {
    return value.toString();
  }
  if (t !== 'object') return value;
  if (Array.isArray(value)) return value.map(sanitizeForJson);

  const result: Record<string, any> = {};
  for (const key of Object.keys(value)) {
    result[key] = sanitizeForJson(value[key]);
  }
  return result;
}

export function getDefaultSuccessMessage(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'Success';
    case 'POST':
      return 'Created';
    case 'PUT':
    case 'PATCH':
      return 'Updated';
    case 'DELETE':
      return 'Deleted';
    default:
      return 'Success';
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | Record<string, any>;
  message: string;
  statusCode: number;
  timestamp: string;
  method: string;
  path: string;
  requestId: string | null;
}

export const successResponse = <T = any>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string,
): Response => {
  const req = (res.req || {}) as Request;
  const path = req.originalUrl ? req.originalUrl.split('?')[0] : req.url || '';
  const responsePayload: ApiResponse<T> = {
    success: true,
    data: sanitizeForJson(data),
    message: message || getDefaultSuccessMessage(req.method || 'GET'),
    statusCode,
    timestamp: new Date().toISOString(),
    method: req.method || 'GET',
    path,
    requestId: (req as any).requestId || null,
  };
  return res.status(statusCode).json(responsePayload);
};

export const errorResponse = (
  res: Response,
  error: any,
  statusCode: number = 500,
  message: string = 'Internal server error',
): Response => {
  const req = (res.req || {}) as Request;
  const path = req.originalUrl ? req.originalUrl.split('?')[0] : req.url || '';
  const parsedError =
    typeof error === 'object' && error !== null && error.message ? error.message : error;

  const responsePayload: ApiResponse<null> = {
    success: false,
    error: parsedError,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    method: req.method || 'GET',
    path,
    requestId: (req as any).requestId || null,
  };
  return res.status(statusCode).json(responsePayload);
};
