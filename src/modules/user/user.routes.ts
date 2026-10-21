import { Router } from 'express';
import { UserController } from './user.controller';
import { UserValidator } from './user.validator';
import { validateRequest } from '../../middlewares';

const router = Router();

// Standard CRUD endpoints
router.post('/user', validateRequest(UserValidator.create), UserController.create);
router.get('/user', UserController.getAll);
router.get('/user/:id', UserController.getById);
router.put('/user/:id', validateRequest(UserValidator.update), UserController.update);
router.delete('/user/:id', UserController.delete);

// Compatibility alias routes (/o/user)
router.post('/o/user', validateRequest(UserValidator.create), UserController.create);
router.get('/o/user', UserController.getAll);
router.get('/o/user/:id', UserController.getById);
router.put('/o/user/:id', validateRequest(UserValidator.update), UserController.update);
router.delete('/o/user/:id', UserController.delete);

export default router;
