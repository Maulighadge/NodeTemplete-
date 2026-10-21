import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, originalUrl, ip } = req;
    const statusCode = res.statusCode;
    const requestId = req.requestId || '-';

    const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms [RequestID: ${requestId}]`;

    if (statusCode >= 500) {
      logger.error(message, { statusCode, duration, requestId, ip, method, url: originalUrl });
    } else if (statusCode >= 400) {
      logger.warn(message, { statusCode, duration, requestId, ip, method, url: originalUrl });
    } else {
      logger.info(message, { statusCode, duration, requestId, ip, method, url: originalUrl });
    }
  });

  next();
};
