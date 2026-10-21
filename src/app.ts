import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import { v4 as uuidv4 } from 'uuid';
import { requestLogger, apiRateLimiter } from './middlewares';
import { errorResponse, logger } from './utils';
import apiRoutes from './modules';

const app = express();

// Trust reverse proxies (e.g., Nginx, AWS ALB, Cloudflare)
app.set('trust proxy', 1);

// 1. Request ID Tracking
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.requestId = uuidv4();
  next();
});

// 2. Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }),
);

// 3. CORS Configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-request-id'],
  }),
);

// 4. Response Compression
app.use(compression());

// 5. Body Parsers with Memory Bounds
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 6. HTTP Parameter Pollution Protection
app.use(hpp());

// 7. Dotfile & Sensitive Path Shield
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/.') || req.path.includes('/..')) {
    errorResponse(res, 'Access denied', 403, 'FORBIDDEN_403');
    return;
  }
  next();
});

// 8. HTTP Request Logging
app.use(requestLogger);

// 9. Global Rate Limiter
app.use('/api', apiRateLimiter);

// 10. API Routes
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// 11. 404 Route Not Found Handler
app.use((req: Request, res: Response) => {
  errorResponse(res, `Route ${req.method} ${req.originalUrl} not found`, 404, 'NOT_FOUND_404');
});

// 12. Global Centralized Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message || 'Internal server error'
      : err.isOperational
        ? err.message
        : 'Internal server error';

  const sanitizedHeaders = { ...req.headers };
  delete sanitizedHeaders.authorization;
  delete sanitizedHeaders.cookie;

  logger.error('Unhandled Application Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    path: req.path,
    method: req.method,
    headers: sanitizedHeaders,
    requestId: req.requestId || null,
  });

  errorResponse(res, message, statusCode);
});

export default app;
