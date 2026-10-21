import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequest } from '../../src/middlewares/validateRequest';

describe('validateRequest Middleware', () => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
  });

  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should call next() when payload is valid', async () => {
    mockReq = {
      body: { name: 'Alice', email: 'alice@example.com' },
      originalUrl: '/test',
      method: 'POST',
    };

    const middleware = validateRequest(schema);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.body).toEqual({ name: 'Alice', email: 'alice@example.com' });
  });

  it('should return 400 when required fields are missing', async () => {
    mockReq = {
      body: { name: 'Alice' },
      originalUrl: '/test',
      method: 'POST',
    };

    const middleware = validateRequest(schema);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: 400,
        message: 'VALIDATION_FAILED_400',
      }),
    );
  });
});
