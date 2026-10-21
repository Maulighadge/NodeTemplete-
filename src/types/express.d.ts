/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: any;
    }
  }
}
