import { Router } from 'express';
import { ExampleController } from './example.controller';
import { ExampleValidator } from './example.validator';
import { validateRequest } from '../../middlewares';

const router = Router();

// Blueprint routes: /o/example
router.post(
  '/o/example',
  validateRequest(ExampleValidator.createOrUpdate),
  ExampleController.create,
);
router.get('/o/example', ExampleController.getAll);
router.get('/o/example/:id', ExampleController.getById);
router.put(
  '/o/example/:id',
  validateRequest(ExampleValidator.createOrUpdate),
  ExampleController.update,
);
router.delete('/o/example/:id', ExampleController.delete);

// Standard aliases: /example
router.post(
  '/example',
  validateRequest(ExampleValidator.createOrUpdate),
  ExampleController.create,
);
router.get('/example', ExampleController.getAll);
router.get('/example/:id', ExampleController.getById);
router.put(
  '/example/:id',
  validateRequest(ExampleValidator.createOrUpdate),
  ExampleController.update,
);
router.delete('/example/:id', ExampleController.delete);

export default router;
