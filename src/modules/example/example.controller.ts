import { Request, Response } from 'express';
import { ExampleService } from './example.service';
import {
  successResponse,
  errorResponse,
  AppError,
  handlePrismaError,
  getPaginationParams,
} from '../../utils';

export const ExampleController = {
  async create(req: Request, res: Response) {
    try {
      const result = await ExampleService.create(req.body);
      return successResponse(res, result, 201, 'Created successfully');
    } catch (error: any) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.statusCode);
      }
      const prismaErr = handlePrismaError(error);
      return errorResponse(res, prismaErr.message, prismaErr.statusCode);
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      if (req.query.page || req.query.limit) {
        const pagination = getPaginationParams(req.query);
        const result = await ExampleService.getPaginated(pagination);
        return successResponse(res, result, 200, 'Fetched successfully');
      }

      const result = await ExampleService.getAll();
      return successResponse(res, result, 200, 'Fetched successfully');
    } catch (error: any) {
      return errorResponse(res, 'Failed to fetch records', 500, error.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const result = await ExampleService.getById(req.params.id);
      return successResponse(res, result, 200, 'Fetched record');
    } catch (error: any) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.statusCode);
      }
      const prismaErr = handlePrismaError(error);
      return errorResponse(res, prismaErr.message, prismaErr.statusCode);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const result = await ExampleService.update(req.params.id, req.body);
      return successResponse(res, result, 200, 'Updated successfully');
    } catch (error: any) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.statusCode);
      }
      const prismaErr = handlePrismaError(error);
      return errorResponse(res, prismaErr.message, prismaErr.statusCode);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const result = await ExampleService.delete(req.params.id);
      return successResponse(res, result, 200, 'Deleted successfully');
    } catch (error: any) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.statusCode);
      }
      const prismaErr = handlePrismaError(error);
      return errorResponse(res, prismaErr.message, prismaErr.statusCode);
    }
  },
};
