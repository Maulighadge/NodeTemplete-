import { Prisma } from '@prisma/client';
import { AppError, handlePrismaError } from '../../src/utils/prismaErrorHandler';

describe('Prisma Error Handler & AppError', () => {
  it('should instantiate AppError with correct fields', () => {
    const error = new AppError(404, 'Item not found', 'id');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Item not found');
    expect(error.field).toBe('id');
    expect(error.name).toBe('AppError');
  });

  it('should translate P2002 unique constraint error', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Unique error', {
      code: 'P2002',
      clientVersion: '5.14.0',
      meta: { target: ['email'] },
    });

    const translated = handlePrismaError(prismaError);
    expect(translated.statusCode).toBe(409);
    expect(translated.message).toContain('Unique constraint failed');
    expect(translated.field).toBe('email');
  });

  it('should translate P2025 record not found error', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Not found error', {
      code: 'P2025',
      clientVersion: '5.14.0',
    });

    const translated = handlePrismaError(prismaError);
    expect(translated.statusCode).toBe(404);
    expect(translated.message).toBe('Record not found.');
  });

  it('should translate P2003 foreign key constraint error', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Foreign key error', {
      code: 'P2003',
      clientVersion: '5.14.0',
      meta: { field_name: 'userId' },
    });

    const translated = handlePrismaError(prismaError);
    expect(translated.statusCode).toBe(400);
    expect(translated.message).toContain('Foreign key constraint failed');
  });

  it('should fallback to 500 on unexpected errors', () => {
    const translated = handlePrismaError(new Error('Unknown generic error'));
    expect(translated.statusCode).toBe(500);
    expect(translated.message).toContain('unexpected internal database error');
  });
});
