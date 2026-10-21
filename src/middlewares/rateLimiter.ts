import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 mins default
const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

export const apiRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    errorResponse(
      res,
      'Too many requests from this IP, please try again later',
      429,
      'RATE_LIMIT_EXCEEDED_429',
    );
  },
});
