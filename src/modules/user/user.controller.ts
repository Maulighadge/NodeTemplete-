import { Request, Response } from 'express';
import { UserService } from './user.service';
import {
  successResponse,
  errorResponse,
  AppError,
  handlePrismaError,
  getPaginationParams,
} from '../../utils';

export const UserController = {
  async create(req: Request, res: Response) {
    try {
      const result = await UserService.create(req.body);
      return successResponse(res, result, 201, 'User created successfully');
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
        const result = await UserService.getPaginated(pagination);
        return successResponse(res, result, 200, 'Users fetched successfully');
      }

      const result = await UserService.getAll();
      return successResponse(res, result, 200, 'Users fetched successfully');
    } catch (error: any) {
      return errorResponse(res, 'Failed to fetch users', 500, error.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const result = await UserService.getById(req.params.id);
      return successResponse(res, result, 200, 'User fetched successfully');
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
      const result = await UserService.update(req.params.id, req.body);
      return successResponse(res, result, 200, 'User updated successfully');
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
      const result = await UserService.delete(req.params.id);
      return successResponse(res, result, 200, 'User deleted successfully');
    } catch (error: any) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.statusCode);
      }
      const prismaErr = handlePrismaError(error);
      return errorResponse(res, prismaErr.message, prismaErr.statusCode);
    }
  },
};
