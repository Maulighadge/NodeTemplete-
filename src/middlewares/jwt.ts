import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils';

const JWT_SECRET = process.env.JWT_SECRET || 'node_template_dev_secret_key_12345';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

export const signToken = (payload: JwtPayload, expiresIn = '7d'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorResponse(res, 'Authentication token required', 401, 'UNAUTHORIZED_401');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    errorResponse(res, 'Invalid or expired authentication token', 401, 'UNAUTHORIZED_401');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Authentication required', 401, 'UNAUTHORIZED_401');
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      errorResponse(
        res,
        'You do not have permission to perform this action',
        403,
        'FORBIDDEN_403',
      );
      return;
    }

    next();
  };
};
