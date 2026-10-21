import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { errorResponse } from '../utils';

type ValidationTarget = 'body' | 'query' | 'params';

export const validateRequest = (schema: Schema, target: ValidationTarget = 'body') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dataToValidate = req[target];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const firstError = error.details[0].message.replace(/['"]/g, '');
      errorResponse(res, firstError, 400, 'VALIDATION_FAILED_400');
      return;
    }

    req[target] = value;
    next();
  };
};
