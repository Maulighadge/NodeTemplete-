import { Prisma } from '@prisma/client';

export class AppError extends Error {
  public code: number;
  public statusCode: number;
  public field?: string;

  constructor(statusCode: number, message: string, field?: string) {
    super(message);
    this.name = 'AppError';
    this.code = statusCode;
    this.statusCode = statusCode;
    this.field = field;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface PrismaErrorTranslation {
  statusCode: number;
  message: string;
  field?: string;
}

export function handlePrismaError(error: any): PrismaErrorTranslation {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2000':
        return { statusCode: 400, message: 'Input value is too long for the field.' };
      case 'P2001':
      case 'P2025':
        return { statusCode: 404, message: 'Record not found.' };
      case 'P2002': {
        const target = Array.isArray(error.meta?.target)
          ? error.meta?.target.join(', ')
          : String(error.meta?.target || 'field');
        return {
          statusCode: 409,
          message: `Unique constraint failed on field: ${target}`,
          field: target,
        };
      }
      case 'P2003': {
        const field = String(error.meta?.field_name || error.meta?.target || 'relation');
        return {
          statusCode: 400,
          message: `Foreign key constraint failed on field: ${field}`,
          field,
        };
      }
      case 'P2021':
        return { statusCode: 500, message: 'The specified database table does not exist.' };
      case 'P2024':
        return { statusCode: 504, message: 'Timed out waiting to fetch a database connection.' };
      default:
        return { statusCode: 400, message: `Database error code ${error.code}` };
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return { statusCode: 400, message: 'Database schema validation error.' };
  }

  return { statusCode: 500, message: 'An unexpected internal database error occurred.' };
}
