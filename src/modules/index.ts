import { Router } from 'express';
import userRoutes from './user/user.routes';
import exampleRoutes from './example/example.routes';
import { successResponse } from '../utils';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  return successResponse(
    res,
    {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    200,
    'Service is healthy',
  );
});

// Mount domain routes
router.use('/', userRoutes);
router.use('/', exampleRoutes);

export default router;
